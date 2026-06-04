const overlay    = () => document.getElementById('modal-overlay');
const tierNameEl = () => document.getElementById('modal-tier-name');
const valueEl    = () => document.getElementById('modal-value');

export function showModal(tier, value) {
  document.documentElement.style.setProperty('--tier-color', tier.color);
  tierNameEl().textContent = `${tier.label} Chest`;
  valueEl().textContent    = value;
  overlay().classList.add('visible');
}

export function hideModal() {
  overlay().classList.remove('visible');
}

export function initModal(onCollect) {
  document.getElementById('collect-btn').addEventListener('click', () => {
    hideModal();
    onCollect();
  });
}
