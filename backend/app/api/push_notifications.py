"""
Push Notifications API
Работа с Web Push уведомлениями для специалистов и заказчиков
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from pywebpush import webpush, WebPushException
import json
import os
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.push_subscription import PushSubscription
from app.models.notification import Notification, NotificationType

router = APIRouter(prefix="/api/push", tags=["push-notifications"])

# VAPID keys для Web Push
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
VAPID_CLAIMS = {
    "sub": f"mailto:{os.getenv('ADMIN_EMAIL', 'admin@yodo.ru')}"
}

class SubscribeRequest(BaseModel):
    subscription: dict
    user_agent: Optional[str] = None

class SendNotificationRequest(BaseModel):
    user_id: Optional[str] = None  # Если None - отправить всем
    title: str
    body: str
    icon: Optional[str] = None
    badge: Optional[str] = None
    image: Optional[str] = None
    data: Optional[dict] = None
    actions: Optional[List[dict]] = None

@router.post("/subscribe")
async def subscribe_to_push(
    request: SubscribeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Подписка пользователя на Push уведомления
    Сохраняем subscription в БД
    """
    
    # Проверяем есть ли уже такая подписка
    existing = db.query(PushSubscription).filter(
        PushSubscription.user_id == current_user.id,
        PushSubscription.endpoint == request.subscription.get("endpoint")
    ).first()
    
    if existing:
        # Обновляем существующую
        existing.subscription_data = request.subscription
        existing.user_agent = request.user_agent
        existing.updated_at = datetime.utcnow()
    else:
        # Создаём новую
        subscription = PushSubscription(
            user_id=current_user.id,
            endpoint=request.subscription.get("endpoint"),
            subscription_data=request.subscription,
            user_agent=request.user_agent
        )
        db.add(subscription)
    
    db.commit()
    
    return {"status": "subscribed", "message": "Successfully subscribed to push notifications"}

@router.post("/unsubscribe")
async def unsubscribe_from_push(
    request: SubscribeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Отписка от Push уведомлений"""
    
    subscription = db.query(PushSubscription).filter(
        PushSubscription.user_id == current_user.id,
        PushSubscription.endpoint == request.subscription.get("endpoint")
    ).first()
    
    if subscription:
        db.delete(subscription)
        db.commit()
    
    return {"status": "unsubscribed", "message": "Successfully unsubscribed from push notifications"}

@router.post("/send")
async def send_push_notification(
    request: SendNotificationRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Отправка Push уведомления
    Только для администраторов или системных процессов
    """
    
    # TODO: Проверка прав (только админы или система)
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Not authorized")
    
    # Получаем подписки
    query = db.query(PushSubscription).filter(PushSubscription.is_active == True)
    
    if request.user_id:
        # Отправить конкретному пользователю
        query = query.filter(PushSubscription.user_id == request.user_id)
    
    subscriptions = query.all()
    
    if not subscriptions:
        raise HTTPException(status_code=404, detail="No active subscriptions found")
    
    # Формируем payload
    payload = {
        "title": request.title,
        "body": request.body,
        "icon": request.icon or "/icons/icon-192x192.png",
        "badge": request.badge or "/icons/badge-72x72.png",
        "image": request.image,
        "data": request.data or {},
        "actions": request.actions or []
    }
    
    # Отправляем уведомления асинхронно
    for subscription in subscriptions:
        background_tasks.add_task(
            send_web_push,
            subscription.subscription_data,
            payload,
            subscription.id,
            db
        )
    
    # Сохраняем уведомление в БД
    notification = Notification(
        user_id=request.user_id,
        title=request.title,
        body=request.body,
        data=request.data,
        type=NotificationType.PUSH
    )
    db.add(notification)
    db.commit()
    
    return {
        "status": "sent",
        "message": f"Push notification sent to {len(subscriptions)} device(s)"
    }

async def send_web_push(subscription_data: dict, payload: dict, subscription_id: int, db: Session):
    """
    Отправка Web Push уведомления
    Используем pywebpush библиотеку
    """
    
    try:
        webpush(
            subscription_info=subscription_data,
            data=json.dumps(payload),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS
        )
        
        print(f"Push notification sent successfully to subscription {subscription_id}")
        
    except WebPushException as e:
        print(f"Failed to send push notification to subscription {subscription_id}: {e}")
        
        # Если подписка невалидна (410 Gone) - удаляем её
        if e.response and e.response.status_code == 410:
            subscription = db.query(PushSubscription).filter(
                PushSubscription.id == subscription_id
            ).first()
            if subscription:
                db.delete(subscription)
                db.commit()

@router.get("/subscriptions")
async def get_user_subscriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить все подписки текущего пользователя"""
    
    subscriptions = db.query(PushSubscription).filter(
        PushSubscription.user_id == current_user.id,
        PushSubscription.is_active == True
    ).all()
    
    return {
        "subscriptions": [
            {
                "id": sub.id,
                "endpoint": sub.endpoint,
                "created_at": sub.created_at,
                "user_agent": sub.user_agent
            }
            for sub in subscriptions
        ]
    }

# Вспомогательные функции для отправки уведомлений о событиях

async def notify_new_order(specialist_ids: List[str], order_id: str, order_title: str, price: float, db: Session):
    """Уведомление специалистам о новом заказе"""
    
    payload = {
        "title": "🔔 Новый заказ!",
        "body": f"{order_title} - {price:,.0f} ₽",
        "icon": "/icons/new-order.png",
        "data": {
            "type": "new_order",
            "orderId": order_id,
            "url": f"/specialist/orders/{order_id}"
        },
        "actions": [
            {"action": "view", "title": "Посмотреть"},
            {"action": "ignore", "title": "Позже"}
        ]
    }
    
    for specialist_id in specialist_ids:
        subscriptions = db.query(PushSubscription).filter(
            PushSubscription.user_id == specialist_id,
            PushSubscription.is_active == True
        ).all()
        
        for subscription in subscriptions:
            try:
                await send_web_push(subscription.subscription_data, payload, subscription.id, db)
            except Exception as e:
                print(f"Error sending notification: {e}")

async def notify_new_message(user_id: str, sender_name: str, message_preview: str, db: Session):
    """Уведомление о новом сообщении"""
    
    payload = {
        "title": f"💬 Сообщение от {sender_name}",
        "body": message_preview,
        "icon": "/icons/message.png",
        "data": {
            "type": "message",
            "url": "/specialist/messages"
        },
        "actions": [
            {"action": "reply", "title": "Ответить"},
            {"action": "view", "title": "Открыть"}
        ]
    }
    
    subscriptions = db.query(PushSubscription).filter(
        PushSubscription.user_id == user_id,
        PushSubscription.is_active == True
    ).all()
    
    for subscription in subscriptions:
        try:
            await send_web_push(subscription.subscription_data, payload, subscription.id, db)
        except Exception as e:
            print(f"Error sending notification: {e}")

async def notify_payment_received(specialist_id: str, amount: float, order_title: str, db: Session):
    """Уведомление о получении платежа"""
    
    payload = {
        "title": "💰 Получен платёж!",
        "body": f"{amount:,.0f} ₽ за \"{order_title}\"",
        "icon": "/icons/payment.png",
        "data": {
            "type": "payment",
            "url": "/specialist/finances"
        }
    }
    
    subscriptions = db.query(PushSubscription).filter(
        PushSubscription.user_id == specialist_id,
        PushSubscription.is_active == True
    ).all()
    
    for subscription in subscriptions:
        try:
            await send_web_push(subscription.subscription_data, payload, subscription.id, db)
        except Exception as e:
            print(f"Error sending notification: {e}")

async def notify_new_review(specialist_id: str, client_name: str, rating: float, db: Session):
    """Уведомление о новом отзыве"""
    
    payload = {
        "title": "⭐ Новый отзыв",
        "body": f"{client_name} оставил отзыв: {rating}/5",
        "icon": "/icons/review.png",
        "data": {
            "type": "review",
            "url": "/specialist/reviews"
        }
    }
    
    subscriptions = db.query(PushSubscription).filter(
        PushSubscription.user_id == specialist_id,
        PushSubscription.is_active == True
    ).all()
    
    for subscription in subscriptions:
        try:
            await send_web_push(subscription.subscription_data, payload, subscription.id, db)
        except Exception as e:
            print(f"Error sending notification: {e}")

