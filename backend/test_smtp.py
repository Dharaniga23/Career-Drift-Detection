import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv
import os

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

print(f"Testing SMTP login for: {SMTP_EMAIL}")

try:
    msg = EmailMessage()
    msg.set_content("This is a direct test email from Python.")
    msg["Subject"] = "Test SMTP Connection"
    msg["From"] = SMTP_EMAIL
    msg["To"] = SMTP_EMAIL

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.set_debuglevel(1)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
    print("SMTP connection and delivery SUCCESSFUL!")
except Exception as e:
    print(f"SMTP FAILED: {e}")
