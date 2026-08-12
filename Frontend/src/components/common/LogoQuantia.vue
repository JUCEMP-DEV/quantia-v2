<template>
  <div class="logo-quantia" role="img" aria-label="Quantia Vivienda">
    <svg class="logo-mark" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="q-ring" x1="18" y1="20" x2="102" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#45D7FF" />
          <stop offset="58%" stop-color="#4E7FFF" />
          <stop offset="100%" stop-color="#A947FF" />
        </linearGradient>
        <linearGradient id="q-bars" x1="40" y1="50" x2="74" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#61E7FF" />
          <stop offset="100%" stop-color="#8D56FF" />
        </linearGradient>
      </defs>

      <circle cx="56" cy="56" r="36" fill="none" stroke="url(#q-ring)" stroke-width="9" stroke-linecap="round" />
      <path d="M79 81 L102 103" fill="none" stroke="url(#q-ring)" stroke-width="9" stroke-linecap="round" />

      <path d="M34 57 L56 41 L78 57" fill="none" stroke="url(#q-ring)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
      <rect x="42" y="74" width="9" height="11" rx="2.5" fill="url(#q-bars)" />
      <rect x="56" y="66" width="9" height="19" rx="2.5" fill="url(#q-bars)" />
      <rect x="70" y="57" width="9" height="28" rx="2.5" fill="url(#q-bars)" />
    </svg>
    <div class="logo-text">
      <strong>Quantia</strong>
      <span>Vivienda</span>
    </div>
  </div>
</template>

<style scoped>
.logo-quantia {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  width: 88px;
  height: 88px;
  filter: drop-shadow(0 8px 20px rgba(67, 179, 255, 0.22));
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.logo-text strong {
  font-size: clamp(1.7rem, 1.2rem + 1.2vw, 2.4rem);
  color: #ffffff;
  font-weight: 900;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 10px rgba(9, 16, 58, 0.28);
}

.logo-text span {
  margin-top: 5px;
  color: rgba(241, 247, 255, 0.96);
  font-size: clamp(0.95rem, 0.72rem + 0.5vw, 1.25rem);
  font-weight: 500;
  text-shadow: 0 2px 10px rgba(9, 16, 58, 0.24);
}

@media (max-width: 720px) {
  .logo-mark {
    width: 72px;
    height: 72px;
  }
}
</style>
