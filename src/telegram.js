export function initTelegram() {
  if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
  }
}
