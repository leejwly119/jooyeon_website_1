// Year
document.getElementById('year').textContent = new Date().getFullYear();

// IntersectionObserver for reveal-ups
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, {threshold: 0.18});

document.querySelectorAll('.reveal-up').forEach(el=>io.observe(el));

// Gentle marquee restart on tab visibility change
document.addEventListener('visibilitychange', ()=>{
  const track = document.querySelector('.marquee .track');
  if(track){
    track.style.animation = 'none';
    void track.offsetWidth; // restart
    track.style.animation = '';
  }
});

document.querySelectorAll(".dropdown").forEach(dropdown => {
  let timeout;

  dropdown.addEventListener("mouseenter", () => {
    // close all other dropdowns
    document.querySelectorAll(".dropdown").forEach(d => {
      if (d !== dropdown) d.classList.remove("open");
    });

    clearTimeout(timeout);
    dropdown.classList.add("open");
  });

  dropdown.addEventListener("mouseleave", () => {
    timeout = setTimeout(() => {
      dropdown.classList.remove("open");
    }, 350); // 👈 delay in ms (300–500 is ideal)
  });
});
