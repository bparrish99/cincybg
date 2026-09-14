(() => {
  const year = document.querySelector("[data-year]");
  const countdown = document.querySelector("[data-countdown]");

  if (year) year.textContent = String(new Date().getFullYear());

  if (!countdown) return;

  const start = new Date("2026-10-10T11:30:00-04:00");
  const nodes = {
    days: countdown.querySelector("[data-days]"),
    hours: countdown.querySelector("[data-hours]"),
    minutes: countdown.querySelector("[data-minutes]"),
  };

  const tick = () => {
    const diff = start.getTime() - Date.now();
    if (diff <= 0) {
      countdown.innerHTML = "<p class='weekday'>Registration is open — see you at Marion's.</p>";
      return;
    }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (nodes.days) nodes.days.textContent = String(days);
    if (nodes.hours) nodes.hours.textContent = String(hours);
    if (nodes.minutes) nodes.minutes.textContent = String(minutes);
  };

  tick();
  setInterval(tick, 30000);
})();
