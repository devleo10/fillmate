
export function showNotification(message, type = 'success') {
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}

export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export async function saveData(data) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'saveData', data },
      (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Unknown error'));
        }
      }
    );
  });
}
