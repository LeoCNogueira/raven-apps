(function () {
  var T = JSON.parse(document.getElementById('i18n').textContent);
  document.documentElement.classList.add('js');

  // Relatório: uma única sequência ao carregar a página
  var rows = Array.prototype.slice.call(document.querySelectorAll('.rows li'));
  var foot = document.querySelector('.report-foot');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    rows.forEach(function (r) { r.classList.add('done'); });
    foot.classList.add('done');
  } else {
    rows.forEach(function (r, i) { setTimeout(function () { r.classList.add('done'); }, 450 + i * 420); });
    setTimeout(function () { foot.classList.add('done'); }, 450 + rows.length * 420 + 150);
  }

  // Por onde começar / Where to start
  var box = document.getElementById('resposta');
  document.querySelectorAll('.option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.option').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      var a = T.answers[btn.dataset.pick];
      box.removeAttribute('data-changed'); void box.offsetWidth; box.setAttribute('data-changed', '');
      box.innerHTML = '';
      var h = document.createElement('h3'); h.textContent = a.t;
      var p = document.createElement('p'); p.textContent = a.p;
      var l = document.createElement('a'); l.className = 'btn btn-primary'; l.href = a.h; l.textContent = a.b;
      box.append(h, p, l);
    });
  });

  // Lista de e-mail (Mailchimp, sem sair da página)
  var form = document.getElementById('form-lista');
  var msg = document.getElementById('form-msg');
  var action = form.getAttribute('action');
  var configured = action.indexOf('list-manage.com/subscribe/post') !== -1;
  if (configured) {
    var q = new URL(action, location.href).searchParams;
    document.getElementById('mc-honeypot').name = 'b_' + q.get('u') + '_' + q.get('id');
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = form.EMAIL.value.trim();
    if (!configured) {
      window.location.href = 'mailto:support@internetmidia.com?subject=' + encodeURIComponent(T.mailSubject) + '&body=' + encodeURIComponent(email);
      return;
    }
    msg.textContent = T.sending;
    var cb = 'mcRaven' + Date.now();
    var params = new URLSearchParams(new FormData(form)).toString();
    var url = action.replace('/subscribe/post?', '/subscribe/post-json?') + '&' + params + '&c=' + cb;
    var s = document.createElement('script');
    var timer = setTimeout(function () { cleanup(); msg.textContent = T.timeout; }, 10000);
    function cleanup() { clearTimeout(timer); delete window[cb]; s.remove(); }
    window[cb] = function (resp) {
      cleanup();
      if (resp && resp.result === 'success') { form.reset(); msg.textContent = T.ok; }
      else {
        var text = String((resp && resp.msg) || '');
        if (/already subscribed|já está inscrit/i.test(text)) { msg.textContent = T.already; }
        else if (/too many/i.test(text)) { msg.textContent = T.tooMany; }
        else { msg.textContent = T.error; }
      }
    };
    s.onerror = function () { cleanup(); msg.textContent = T.offline; };
    s.src = url;
    document.body.appendChild(s);
  });
})();
