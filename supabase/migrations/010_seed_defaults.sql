-- Seed default settings and templates
-- Related: 001_sms_settings.sql, 002_sms_templates.sql

-- Insert default settings (single row)
INSERT INTO public.sms_settings (id, sender_id, default_country_code, test_mode, gateway_enabled, debug_logging)
VALUES (1, 'KWT-SMS', '965', true, false, true)
ON CONFLICT (id) DO NOTHING;

-- Insert default templates
INSERT INTO public.sms_templates (slug, description, body_en, body_ar, default_body_en, default_body_ar) VALUES
(
    'auth_otp',
    'OTP verification code for phone authentication',
    'Your verification code is: {{otp}}',
    'رمز التحقق الخاص بك هو: {{otp}}',
    'Your verification code is: {{otp}}',
    'رمز التحقق الخاص بك هو: {{otp}}'
),
(
    'order_confirmed',
    'Order confirmation notification',
    'Your order #{{order_id}} has been confirmed.',
    'تم تأكيد طلبك رقم #{{order_id}}.',
    'Your order #{{order_id}} has been confirmed.',
    'تم تأكيد طلبك رقم #{{order_id}}.'
),
(
    'order_shipped',
    'Order shipped notification',
    'Your order #{{order_id}} has been shipped.',
    'تم شحن طلبك رقم #{{order_id}}.',
    'Your order #{{order_id}} has been shipped.',
    'تم شحن طلبك رقم #{{order_id}}.'
),
(
    'order_delivered',
    'Order delivered notification',
    'Your order #{{order_id}} has been delivered.',
    'تم توصيل طلبك رقم #{{order_id}}.',
    'Your order #{{order_id}} has been delivered.',
    'تم توصيل طلبك رقم #{{order_id}}.'
),
(
    'order_cancelled',
    'Order cancelled notification',
    'Your order #{{order_id}} has been cancelled.',
    'تم إلغاء طلبك رقم #{{order_id}}.',
    'Your order #{{order_id}} has been cancelled.',
    'تم إلغاء طلبك رقم #{{order_id}}.'
),
(
    'payment_received',
    'Payment received confirmation',
    'Payment of {{amount}} received. Thank you.',
    'تم استلام دفعة بقيمة {{amount}}. شكرا لك.',
    'Payment of {{amount}} received. Thank you.',
    'تم استلام دفعة بقيمة {{amount}}. شكرا لك.'
),
(
    'welcome',
    'Welcome message for new users',
    'Welcome to {{app_name}}!',
    'مرحبا بك في {{app_name}}!',
    'Welcome to {{app_name}}!',
    'مرحبا بك في {{app_name}}!'
)
ON CONFLICT (slug) DO NOTHING;
