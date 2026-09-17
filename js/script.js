(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const toast = $('.toast');
  const notify = (msg) => { if(!toast) return; toast.textContent=msg; toast.classList.add('show'); clearTimeout(window.__toast); window.__toast=setTimeout(()=>toast.classList.remove('show'),2600); };

  // Header / navigation
  const header = $('#siteHeader');
  const navToggle = $('.nav-toggle');
  const nav = $('#primaryNav');
  const onScroll = () => { header?.classList.toggle('scrolled', window.scrollY > 24); $('.back-top')?.classList.toggle('is-visible', window.scrollY > 500); };
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  navToggle?.addEventListener('click', () => { const open = nav.classList.toggle('is-open'); navToggle.setAttribute('aria-expanded', String(open)); });
  $$('.nav-link').forEach(a => a.addEventListener('click', () => nav?.classList.remove('is-open')));
  $('.back-top')?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  // Reveal-on-scroll
  const reveal = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target);}}), {threshold:.12});
    reveal.forEach(el=>io.observe(el));
  } else reveal.forEach(el=>el.classList.add('in-view'));

  // Footer year
  $$('[data-year]').forEach(el=>el.textContent = new Date().getFullYear());

  // Booking date guard
  const dateInputs = $$('input[type="date"]');
  const today = new Date(); today.setHours(0,0,0,0); const iso = today.toISOString().slice(0,10);
  dateInputs.forEach(i => { if(!i.min) i.min=iso; });
  const validateDates = (checkIn, checkOut) => {
    if(checkIn?.value && checkOut?.value && checkOut.value <= checkIn.value){ checkOut.setCustomValidity('Check-out must be after check-in.'); return false; }
    checkOut?.setCustomValidity(''); return true;
  };
  const datePair = (root=document) => { const ci=$('[name="checkin"]',root), co=$('[name="checkout"]',root); if(ci&&co){ci.addEventListener('change',()=>{co.min=ci.value||iso;validateDates(ci,co)});co.addEventListener('change',()=>validateDates(ci,co));} };
  datePair();

  // Home / general booking search demo
  $$('[data-booking-search]').forEach(form => form.addEventListener('submit', e => { e.preventDefault(); if(!form.reportValidity()) return; notify('Demo search submitted — connect this UI to your reservation system later.'); }));

  // Room filter
  const roomCards = $$('.room-card[data-price]');
  const roomFilters = $$('[data-room-filter]');
  const filterRooms = () => {
    if(!roomCards.length) return;
    const type = $('[name="room-type-filter"]')?.value || 'all';
    const guest = Number($('[name="guest-filter"]')?.value || 99);
    const price = Number($('[name="price-filter"]')?.value || 9999);
    let visible=0;
    roomCards.forEach(card => { const ok=(type==='all'||card.dataset.roomType===type) && Number(card.dataset.guests)<=guest && Number(card.dataset.price)<=price; card.classList.toggle('hide',!ok); if(ok)visible++; });
    const note=$('[data-filter-note]'); if(note)note.textContent=`${visible} room${visible!==1?'s':''} shown`;
  };
  roomFilters.forEach(el=>el.addEventListener('change',filterRooms)); filterRooms();

  // Category pills (gallery/dining)
  $$('[data-filter-group]').forEach(group => {
    const buttons = $$('.pill',group); const items = $$('[data-filter-item]', group.parentElement.parentElement || document);
    buttons.forEach(btn => btn.addEventListener('click', () => { buttons.forEach(b=>b.classList.remove('is-active')); btn.classList.add('is-active'); const cat=btn.dataset.filter; items.forEach(item=>item.classList.toggle('hide',cat!=='all'&&item.dataset.category!==cat)); }));
  });

  // Gallery lightbox
  const lightbox = $('[data-lightbox]'); const lbImg=$('[data-lightbox-image]');
  const closeLightbox=()=>lightbox?.classList.remove('is-open');
  $$('[data-gallery-image]').forEach(img=>img.addEventListener('click',()=>{ if(!lightbox||!lbImg) return; lbImg.src=img.currentSrc||img.src; lbImg.alt=img.alt; lightbox.classList.add('is-open'); }));
  $('[data-lightbox-close]')?.addEventListener('click',closeLightbox); lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()}); document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox()});

  // Thumb gallery
  const detailMain=$('[data-detail-main]'); $$('.thumb-row button').forEach(btn=>btn.addEventListener('click',()=>{const img=$('img',btn);if(detailMain&&img){detailMain.src=img.src;detailMain.alt=img.alt;}}));

  // Testimonials
  const track=$('[data-testimonial-track]'); const slides=$$('[data-testimonial-slide]'); let slide=0;
  const goSlide=n=>{if(!track||!slides.length)return;slide=(n+slides.length)%slides.length;track.style.transform=`translateX(-${slide*100}%)`;};
  $('[data-test-prev]')?.addEventListener('click',()=>goSlide(slide-1)); $('[data-test-next]')?.addEventListener('click',()=>goSlide(slide+1));
  if(slides.length>1) setInterval(()=>goSlide(slide+1),7000);

  // FAQ accordion
  $$('.faq-q').forEach(q=>q.addEventListener('click',()=>{const item=q.closest('.faq-item');const expanded=item.classList.toggle('is-open');q.setAttribute('aria-expanded',String(expanded));}));

  // Newsletter forms
  $$('[data-newsletter]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;$('.form-status',form.parentElement)?.replaceChildren(document.createTextNode('Thanks — this is a demo subscription form.'));notify('Newsletter signup captured in demo mode.');form.reset();}));

  // Contact form validation
  $('[data-contact-form]')?.addEventListener('submit',e=>{e.preventDefault();const form=e.currentTarget;const status=$('[data-contact-status]');if(!form.reportValidity())return;status.textContent='Thanks! Your demo message passed validation. Connect this form to your email service for production use.';form.reset();});

  // Booking page summary / confirmation
  const bookingForm=$('[data-booking-form]'); const modal=$('[data-booking-modal]');
  const updateSummary=()=>{
    if(!bookingForm)return;
    const room=$('[name="room"]',bookingForm)?.selectedOptions[0]?.textContent||'—';
    const ci=$('[name="checkin"]',bookingForm)?.value||'—'; const co=$('[name="checkout"]',bookingForm)?.value||'—';
    const adults=$('[name="adults"]',bookingForm)?.value||'—'; const children=$('[name="children"]',bookingForm)?.value||'0';
    $('[data-summary-room]')?.replaceChildren(document.createTextNode(room)); $('[data-summary-checkin]')?.replaceChildren(document.createTextNode(ci)); $('[data-summary-checkout]')?.replaceChildren(document.createTextNode(co)); $('[data-summary-guests]')?.replaceChildren(document.createTextNode(`${adults} adults · ${children} children`));
  };
  $$("[data-booking-form] input, [data-booking-form] select, [data-booking-form] textarea").forEach(el=>el.addEventListener('input',updateSummary)); updateSummary();
  bookingForm?.addEventListener('submit',e=>{e.preventDefault();if(!bookingForm.reportValidity())return;modal?.classList.add('is-open');});
  $('[data-modal-close]')?.addEventListener('click',()=>modal?.classList.remove('is-open')); modal?.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('is-open')});

  // Dining category filtering fallback for grids
  const diningPills=$$('[data-dining-filter]'); const diningItems=$$('[data-dining-item]'); diningPills.forEach(btn=>btn.addEventListener('click',()=>{diningPills.forEach(b=>b.classList.remove('is-active'));btn.classList.add('is-active');const cat=btn.dataset.diningFilter;diningItems.forEach(item=>item.classList.toggle('hide',cat!=='all'&&item.dataset.category!==cat));}));

  // Counters
  $$('[data-counter]').forEach(el=>{const target=Number(el.dataset.counter);let done=false;const run=()=>{if(done)return;done=true;let n=0;const step=Math.max(1,Math.ceil(target/50));const id=setInterval(()=>{n=Math.min(target,n+step);el.textContent=n.toLocaleString();if(n>=target)clearInterval(id)},22)}; if('IntersectionObserver' in window){new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting)run()}),{threshold:.8}).observe(el)}else run();});
})();
