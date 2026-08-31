document.addEventListener('DOMContentLoaded', () => {
  const loader = document.querySelector('.fx-page-loader');
  const progress = document.querySelector('.fx-progress span');
  const cursor = document.querySelector('.fx-cursor');
  const ring = document.querySelector('.fx-cursor-ring');
  const header = document.querySelector('.fx-header');

  // Loader
  window.addEventListener('load', () => {
    setTimeout(() => loader?.classList.add('hide'), 500);
  });

  // Scroll progress + header behavior
  let lastScroll = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    header?.classList.toggle('fx-scrolled', y > 25);
    
    lastScroll = y;
  }, {passive:true});

  // Cursor glow / ring
  let mx = window.innerWidth/2, my = window.innerHeight/2;
  let rx = mx, ry = my;
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (cursor) {
      cursor.style.left = `${mx}px`;
      cursor.style.top = `${my}px`;
    }
  }, {passive:true});

  function animateRing(){
    rx += (mx-rx)*.18;
    ry += (my-ry)*.18;
    if (ring) {
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
    }
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Reveal on scroll
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fx-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});

  document.querySelectorAll('.fx-reveal').forEach(el => revealObserver.observe(el));

  // Stagger cards within grids/timelines
  document.querySelectorAll('.skills-container, .projects-container, .timeline, .education-content').forEach(group => {
    [...group.children].forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 90, 360)}ms`;
    });
  });

  // Subtle 3D tilt for cards
  document.querySelectorAll('.skill-card, .project-card, .timeline-content, .education-item').forEach(card => {
    card.addEventListener('mousemove', e => {
      if (window.innerWidth <= 900) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5;
      const y = (e.clientY-r.top)/r.height-.5;
      card.style.transform = `perspective(900px) rotateX(${y*-3}deg) rotateY(${x*4}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Magnetic buttons + cursor ripple origin
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX-r.left, y = e.clientY-r.top;
      btn.style.setProperty('--mx', `${x}px`);
      btn.style.setProperty('--my', `${y}px`);
      if (window.innerWidth > 900) {
        btn.style.transform = `translate(${(x-r.width/2)*.055}px, ${(y-r.height/2)*.055}px)`;
      }
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });

  // Cursor grows over interactive elements
  document.querySelectorAll('a, button, .skill-card, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (!ring) return;
      ring.style.width = '44px';
      ring.style.height = '44px';
      ring.style.borderColor = 'rgba(34,211,238,.8)';
    });
    el.addEventListener('mouseleave', () => {
      if (!ring) return;
      ring.style.width = '28px';
      ring.style.height = '28px';
      ring.style.borderColor = 'rgba(34,211,238,.55)';
    });
  });

  // Active navigation based on section in viewport
  const links = [...document.querySelectorAll('.nav-menu a')];
  const sections = [...document.querySelectorAll('section[id]')];
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, {rootMargin:'-45% 0px -50% 0px', threshold:0});
  sections.forEach(s => navObserver.observe(s));

  // Hero image follows mouse slightly for a cinematic parallax effect.
  const heroImage = document.querySelector('.hero-image');
  heroImage?.addEventListener('mousemove', e => {
    if (window.innerWidth <= 900) return;
    const r = heroImage.getBoundingClientRect();
    const x = (e.clientX-r.left)/r.width-.5;
    const y = (e.clientY-r.top)/r.height-.5;
    heroImage.style.transform =
      `perspective(900px) rotateX(${y*-4}deg) rotateY(${x*6}deg) translateZ(5px)`;
  });
  heroImage?.addEventListener('mouseleave', () => heroImage.style.transform = '');

  // Smooth-scroll with a little offset for fixed navbar.
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({top, behavior:'smooth'});
    });
  });
});


/* ===== CINEMATIC SCROLL ENGINE V2 ===== */
(()=>{const sections=[...document.querySelectorAll(".fx-section")],reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const nums={home:"00",about:"01",skills:"02",projects:"03",experience:"04",education:"05",contact:"06"};
sections.forEach(s=>{const h=s.querySelector(".section-title h2");if(h&&nums[s.id])h.dataset.cinematic=nums[s.id]});
if(reduce){sections.forEach(s=>s.classList.add("fx-in-view"));return}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>.22){e.target.classList.add("fx-in-view");if(e.target.id==="projects")e.target.querySelectorAll(".project-card").forEach((c,i)=>setTimeout(()=>c.classList.add("fx-project-active"),i*120))}}),{threshold:[.22,.5,.75]});
sections.forEach(s=>io.observe(s));
let ticking=false;
function frame(){const vh=innerHeight;
sections.forEach(s=>{const r=s.getBoundingClientRect(),p=Math.max(-1,Math.min(1,(vh/2-(r.top+r.height/2))/(vh+r.height/2)));
const title=s.querySelector(".section-title");if(title&&innerWidth>900)title.style.transform=`translate3d(0,${p*-24}px,0)`;
if(s.id==="home"&&innerWidth>900){const c=s.querySelector(".hero-content"),im=s.querySelector(".hero-image");if(c)c.style.transform=`translate3d(0,${p*-16}px,0)`;if(im)im.style.setProperty("--scroll-rotate",`${p*2}deg`)}
if(s.id==="about"&&innerWidth>900){const im=s.querySelector(".about-image"),t=s.querySelector(".about-text");if(im)im.style.transform=`translate3d(0,${p*-20}px,0)`;if(t)t.style.transform=`translate3d(0,${p*9}px,0)`}
if(s.id==="skills"&&innerWidth>900)s.querySelectorAll(".skill-card").forEach((c,i)=>c.style.transform=`translate3d(${p*8*(i%2?-1:1)}px,${p*-10}px,0)`);
});ticking=false}
addEventListener("scroll",()=>{if(!ticking){requestAnimationFrame(frame);ticking=true}},{passive:true});addEventListener("resize",frame);frame()})();


/* ============================================================
   HANGING PHOTO — ONE-STRING PENDULUM INTERACTION
   ============================================================ */
(() => {
  const scene = document.getElementById('hangingPhoto');
  if (!scene) return;

  let angle = 0;
  let velocity = 0;
  let dragging = false;
  let pointerId = null;
  let lastAngle = 0;
  let lastTime = 0;
  let idleTime = 0;

  const ropeLength = () => {
    const value = getComputedStyle(scene).getPropertyValue('--rope-length').trim();
    return parseFloat(value) || 78;
  };

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  function angleFromPointer(clientX, clientY){
    const rect = scene.getBoundingClientRect();
    const anchorX = rect.left + rect.width / 2;
    const anchorY = rect.top;
    return Math.atan2(clientX - anchorX, clientY - anchorY);
  }

  function render(){
    scene.style.transform = `rotate(${angle}rad)`;
    requestAnimationFrame(render);
  }
  render();

  function start(e){
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    pointerId = e.pointerId;
    scene.classList.add('is-dragging');
    scene.setPointerCapture?.(pointerId);

    const a = angleFromPointer(e.clientX, e.clientY);
    angle = clamp(a, -1.15, 1.15);
    lastAngle = angle;
    lastTime = performance.now();
    velocity = 0;
    idleTime = 0;
    e.preventDefault();
  }

  function move(e){
    if (!dragging || e.pointerId !== pointerId) return;
    const now = performance.now();
    const dt = Math.max(8, now - lastTime) / 1000;
    const a = clamp(angleFromPointer(e.clientX, e.clientY), -1.15, 1.15);

    let delta = a - lastAngle;
    // Prevent impossible angular jumps.
    delta = clamp(delta, -0.45, 0.45);
    velocity = delta / dt;

    angle = a;
    lastAngle = a;
    lastTime = now;
    e.preventDefault();
  }

  function release(e){
    if (!dragging || e.pointerId !== pointerId) return;
    dragging = false;
    scene.classList.remove('is-dragging');
    try{ scene.releasePointerCapture?.(pointerId); }catch(_){}
    // Convert release motion into pendulum velocity.
    velocity = clamp(velocity * 0.78, -4.8, 4.8);
    pointerId = null;
    idleTime = 0;
  }

  scene.addEventListener('pointerdown', start);
  scene.addEventListener('pointermove', move);
  scene.addEventListener('pointerup', release);
  scene.addEventListener('pointercancel', release);

  // Physics runs independently of pointer movement.
  let lastPhysics = performance.now();
  function physics(now){
    const dt = Math.min((now-lastPhysics)/1000, .032);
    lastPhysics = now;

    if (!dragging){
      const L = Math.max(0.45, ropeLength()/100);
      const gravity = 7.6;
      const damping = 0.82;

      // Pendulum equation: angular acceleration = -g/L * sin(theta)
      const acceleration = -(gravity/L) * Math.sin(angle) - damping * velocity;
      velocity += acceleration * dt;
      angle += velocity * dt;

      // Gentle idle motion after it settles, like a hanging photograph.
      idleTime += dt;
      if (Math.abs(angle) < .008 && Math.abs(velocity) < .012 && idleTime > 4){
        angle += Math.sin(idleTime * .9) * .00012;
      }
    }
    requestAnimationFrame(physics);
  }
  requestAnimationFrame(physics);

  // Give mouse users a visual hint without changing the photo content.
  scene.addEventListener('mouseenter', () => {
    scene.style.filter = 'drop-shadow(0 25px 35px rgba(0,0,0,.22))';
  });
  scene.addEventListener('mouseleave', () => {
    if (!dragging) scene.style.filter = '';
  });
})();


/* FINAL NAVBAR VISIBILITY OVERRIDE */
(() => {
  const header = document.querySelector('.fx-header');
  if (!header) return;
  header.classList.remove('fx-hidden');
  header.style.transform = 'translateY(0)';
  window.addEventListener('scroll', () => {
    header.classList.remove('fx-hidden');
    header.style.transform = 'translateY(0)';
  }, {passive:true});
})();

// FINAL NAVBAR SAFETY: never hide the navigation while scrolling.
(() => {
  const nav = document.querySelector('.fx-header, header');
  if (!nav) return;
  nav.classList.remove('fx-hidden');
  const keepVisible = () => {
    nav.classList.remove('fx-hidden');
    nav.style.transform = 'none';
    nav.style.visibility = 'visible';
    nav.style.opacity = '1';
  };
  window.addEventListener('scroll', keepVisible, {passive:true});
  window.addEventListener('wheel', keepVisible, {passive:true});
  keepVisible();
})();

/* Final navbar guard */
document.addEventListener('DOMContentLoaded', function(){
  const nav = document.querySelector('.fx-header');
  if (!nav) return;
  nav.classList.remove('fx-hidden');
  nav.style.position = 'fixed';
  nav.style.top = '0';
  nav.style.transform = 'none';
  nav.style.visibility = 'visible';
  nav.style.opacity = '1';
});
window.addEventListener('scroll', function(){
  const nav = document.querySelector('.fx-header');
  if (!nav) return;
  nav.classList.remove('fx-hidden');
  nav.style.transform = 'none';
}, {passive:true});

/* FINAL NAVBAR GUARD — sticky, always visible */
(() => {
  const nav = document.querySelector('.fx-header, body > header');
  if (!nav) return;
  const keepNav = () => {
    nav.classList.remove('fx-hidden');
    nav.style.position = 'sticky';
    nav.style.top = '0px';
    nav.style.transform = 'none';
    nav.style.visibility = 'visible';
    nav.style.opacity = '1';
  };
  keepNav();
  window.addEventListener('scroll', keepNav, {passive:true});
  window.addEventListener('resize', keepNav);
})();
