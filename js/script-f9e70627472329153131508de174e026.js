var app = window.app || {};

app.init = function() {
  app.cookieMonster();
  app.initScrollTo();
  app.initMobile();
  app.initFAQ();
  app.initSubNav();
  app.initToggleShow();
  app.initAnouncementBanner();
  app.initScrollVideo();
  app.showReferralBanner();
};

app.initScrollTo = function() {
  document.addEventListener('click', (e) => {
    const scrollto = e.target.closest('.scrollto');
    if (scrollto) {
      const id = scrollto.getAttribute('href');
      const target = document.body.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
};


app.initMobile = function() {
  const nav = document.getElementById('nav');
  const mobileContainer = document.querySelector('.mobile-container');
  const store = new WeakMap();

  document.addEventListener('click', toggleMobileMenu);

  document.addEventListener('animationend', ({ target }) => {
    if (target === mobileContainer) {
      const data = store.get(mobileContainer);
      if (data) {
        target.classList.remove('animated');
        target.classList.remove(data.animation);
        if (data.after) {
          target.classList.add(data.after);
        }
        store.delete(mobileContainer);
      }
    }
  });

  function toggleMobileMenu(e) {
    const mobileIcon = e.target.closest('.mobile-icon');
    if (!mobileIcon) {
      return;
    }
    const menuIcon = document.querySelector('.menu-icon');
    const xIcon = document.querySelector('.x-icon');
    if (menuIcon.classList.contains('hide')) {
      document.body.classList.remove('lock');
      menuIcon.classList.remove('hide');
      xIcon.classList.add('hide');
      // Temporary fix for iOS devices to hide the menu:
      if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
        mobileContainer.classList.add('hide');
      } else {
        mobileContainer.classList.add('animated', 'slideOutDown');
        store.set(mobileContainer, {
          animation: 'slideOutDown',
          after: 'hide',
        });
      }
    } else {
      menuIcon.classList.add('hide');
      xIcon.classList.remove('hide');
      mobileContainer.classList.remove('hide');
      mobileContainer.classList.add('animated', 'slideInUp');
      store.set(mobileContainer, {
        animation: 'slideInUp',
      });
      document.body.classList.add('lock');
      nav.scrollIntoView();
    }
  }

};


app.initFAQ = function() {
  const questions = document.querySelector('.questions');
  if (questions) {
    questions.addEventListener('click', e => {
      if (e.target.classList.contains('questionTitle')) {
        handleQuestionClick(e);
      } else if (e.target.closest('.question-plus, .question-minus')) {
        handleQuestionClick({
          target: e.target.closest('.question').querySelector('.questionTitle')
        });
      }
    });

    function handleQuestionClick(e) {
      const id = e.target.dataset.target;
      const target = document.getElementById(id);
      const question = target.closest('.question');
      if (target.classList.contains('hide')) {
        target.classList.remove('hide');
        question.querySelector('.question-plus').classList.add('hide');
        question.querySelector('.question-minus').classList.remove('hide');
      } else {
        target.classList.add('hide');
        question.querySelector('.question-plus').classList.remove('hide');
        question.querySelector('.question-minus').classList.add('hide');
      }
    }
  }
};

app.initSubNav = function() {
  const subNav = document.querySelector('.subnav-container');
  if (subNav) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
          subNav.classList.remove('sticky');
        } else {
          subNav.classList.add('sticky');
        }
      });
    }, {
      rootMargin: '-48px 0px 0px 0px'
    });
    observer.observe(subNav);
  }
};

app.initToggleShow = function() {
  const hasToggle = !!document.querySelector('.toggle-trigger');
  if (hasToggle) {
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('.toggle-trigger');
      if (toggle) {
        const content = document.querySelector(toggle.getAttribute('href'));
        if (content.classList.contains('no-show')) {
          content.classList.remove('no-show');
        } else {
          content.classList.add('no-show');
        }
        e.preventDefault();
      }
    });
  }
};

const isPrivacyPage = location.pathname === '/policies/privacy-policy/';

app.cookieMonster = function() {
  let config = JSON.parse(localStorage.getItem('cookie_config'));
  if (config) {
    enable3rdParty(config);
  }
  const monster = renderCookieMonster(config || { f: true, m: true, a: true });
  monster.addEventListener('click', function(e) {
    switch(e.target.dataset.action) {
      case 'accept':
        monster.hidden = true;
        config = JSON.parse(localStorage.getItem('cookie_config')) || { f: true, m: true, a: true };
        localStorage.setItem('cookie_config', JSON.stringify(config));
        enable3rdParty(config);
        break;
      case 'edit':
        monster.classList.add('cookie-monster--show-settings');
        break;
      case 'change':
        const type = e.target.dataset.cookie;
        const value = !config[type];
        updateCookieOption(e.target, value);
        config[type] = value;
        break;
      case 'save':
        monster.hidden = true;
        localStorage.setItem('cookie_config', JSON.stringify(config));
        enable3rdParty(config);
        break;
      default:
        break;
    }
  });
  app.openCookieMonster = function() {
    monster.classList.add('cookie-monster--show-settings');
    if (config) {
      ['f', 'm', 'a'].forEach(function(type) {
        const option = monster.querySelector(`[data-cookie="${type}"]`)
        updateCookieOption(option, config[type]);
      });
    }
    showMonster();
  };
  document.body.insertBefore(monster, document.body.firstChild);
  if (!config) {
    monster.hidden = false;
    if (isPrivacyPage) {
      showMonster();
    } else {
      setTimeout(showMonster, 4500);
    }
  }
  function showMonster() {
    const close = monster.querySelector('.cookie-close');
    if (config) {
      close.setAttribute('title', 'Close');
      close.setAttribute('aria-label', 'Close');
    } else {
      close.setAttribute('title', 'Accept policy');
      close.setAttribute('aria-label', 'Accept policy');
      config = { f: true, m: true, a: true };
    }
    monster.hidden = false;
    monster.style.visibility = 'visible';
    monster.style.opacity = 1;
  }
};

function updateCookieOption(el, value) {
  el.textContent = value ? 'disable' : 'enable';
  el.parentNode.className = `cookie-${value ? 'on' : 'off'}`;
}

function enable3rdParty(conf) {
  const disabledScripts = document.querySelectorAll('script[type^="text/plain"]');
  Array.from(disabledScripts).forEach(function(script) {
    const scriptType = script.getAttribute('type');
    if (
      // at 11th pos "text/plain-<TYPE>" read char ('a', 'm' or 'f')
      // and check if entry is false in the conf object
      (conf && !conf[scriptType[11]])
      || (
        // or if there is an A/B test and script is not part of this test group
        window.testGroup
        && script.className.includes('group-')
        && !script.className.includes(`group-${testGroup}`))
    ) {
      // stop here
      return;
    }
    const parent = script.parentNode;
    parent.removeChild(script);
    // firefox doesn't want us to re-add the script to the dom
    // script.removeAttribute('type');
    // parent.appendChild(script);
    parent.appendChild(Object.assign(document.createElement('script'),
    script.getAttribute('src') && { src: script.getAttribute('src') },
    script.getAttribute('id') && { id: script.getAttribute('id') },
    script.getAttribute('async') && { async: true },
    script.getAttribute('defer') && { defer: true },
    script.innerHTML && { innerHTML: script.innerHTML }
    ));
  });
}

function renderCookieMonster(config) {
  return Object.assign(document.createElement('div'), {
    className: 'cookie-monster',
    style: 'opacity: 0; visibility: hidden;',
    hidden: true,
    innerHTML: `
    <h3 class="cookie-title">🍪 Cookie Monster!</h3>
    <div class="cookie-description">
      <p>${isPrivacyPage ? `
        Glad that you are reading the privacy policy 👍<br>
        We use cookies to improve your browsing experience,
        analyze site traffic and increase the performance
        of our site. You can change the cookie settings below.
      ` : `
        We use cookies to improve your browsing experience,
        analyze site traffic and increase the performance
        of our site. You can change the cookie settings below.
        If you want to know more, we prepared a
        <a href="/policies/privacy-policy/">privacy policy</a>.
      `}</p>
      <button type="button" data-action="accept" class="button primary">
        OK
      </button>
      <button type="button" data-action="edit" class="button secondary">
        Cookie settings
      </button>
    </div>
    <div class="cookie-settings">
      <p>
        We use cookies to improve your browsing experience,
        analyze site traffic and increase the performance
        of our site. ${isPrivacyPage ? '' : `If you want to
        know more, we prepared a
        <a href="/policies/privacy-policy/">privacy policy</a>.
        `}
      </p>
      <ul class="cookie-control">
        <li class="cookie-${config.f ? 'on' : 'off'}">
          <strong>Functional</strong>
          Enhancing your browsing experience, for example
          the support tool to communicate with us.
          <button type="button" data-action="change" data-cookie="f">
            ${config.f ? 'disable' : 'enable'}
          </button>
        </li>
        <li class="cookie-${config.m ? 'on' : 'off'}">
          <strong>Marketing</strong>
          We can deliver content that is relevant to you.
          <button type="button" data-action="change" data-cookie="m">
            ${config.m ? 'disable' : 'enable'}
          </button>
        </li>
        <li class="cookie-${config.a ? 'on' : 'off'}">
          <strong>Analytics</strong>
          We improve our site by seeing what works and what pages are rarely viewed.
          <button type="button" data-action="change" data-cookie="a">
            ${config.a ? 'disable' : 'enable'}
          </button>
        </li>
        <li class="cookie-on cookie-readonly">
          <strong>Essential</strong>
          Some cookies are necessary for the site to work,
          for example the settings in this dialog & basic site analytics.
          These cannot be turned off.
          <button readonly disabled>
            enabled
          </button>
        </li>
      </ul>
      <div class="cookie-footer">
        <button type="button" data-action="save" class="button primary">
          Save
        </button>
        <span class="cookie-info">
          You can change this at any time.
        </span>
      </div>
    </div>
    <button type="button" data-action="accept" class="cookie-close" title="Close" aria-label="Close">
    ✕
    </button>
  `});
}

app.initAnouncementBanner = function() {
  const banners = document.getElementsByClassName('banner');
  for (let banner of banners) {
    let bannerId = banner.id;
    if (new Date() > new Date(banner.dataset.until)) {
      return;
    }
    if (banner && !sessionStorage.getItem(bannerId)) {
      banner.hidden = false;
    }
  }
  document.addEventListener('click', event => {
    if (event.target.className === "closeAnnouncementBanner") {
      const bannerId = event.target.dataset.bannerid;
      const banner = document.getElementById(bannerId)
      banner.hidden = true;
      sessionStorage.setItem(bannerId, 'hide');
    }
  });
};

app.initScrollVideo = function() {
  window.addEventListener('load', function(event) {
    if (testGroup === 'b' && 'IntersectionObserver' in window) {
      const videoContainer = document.querySelector('[data-scrollvideo]');
      if (videoContainer) {
        const video = videoContainer.querySelector('video');
        const frameCounter = document.querySelector('#frame-counter');

        if (video.readyState > 0) {
          loaded();
        } else {
          video.addEventListener('loadedmetadata', loaded);
        }
        let seeking = false;
        video.addEventListener('seeking', () => seeking = true);
        video.addEventListener('seeked', () => seeking = false);

        function loaded() {
          const duration = video.duration;
          const totalFrames = Math.floor(duration * 60);

          video.play();
          video.pause();
          video.currentTime = 0;

          const thresholds = [];
          for (let i = 0; i <= 1.0; i += (1 / totalFrames)) {
            thresholds.push(i);
          }

          let repeat = 0;
          let currentTime = 0;
          let time = 0;
          const containerHeight = videoContainer.parentNode.getBoundingClientRect().height;
          const intersection = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && video.readyState >= 1) {
                  repeat = 50;
                  updateAndMomentum(entry.intersectionRatio);
                } else {
                  console.warn('video.readyState', video.readyState);
                }
              });
            },
            {
              rootMargin: `-${videoContainer.parentNode.offsetTop}px 0px ${containerHeight}px 0px`,
              threshold: thresholds,
            },
          );
          intersection.observe(videoContainer.parentNode);

          function updateAndMomentum(ratio) {
            const height = containerHeight + videoContainer.parentNode.offsetTop;
            const intersectionRatio = ratio || ((height - document.documentElement.scrollTop) / height);
            time = duration - (duration * intersectionRatio);
            currentTime = (currentTime * 0.95) + (time * 0.05);
            if (repeat > 0) {
              if (!seeking) {
                video.currentTime = currentTime;
              }
              if (frameCounter && location.hash === '#debug') {
                frameCounter.textContent = `frame: ${
                  Math.floor(totalFrames - (duration * intersectionRatio * 60)) // 60 fps
                }/${totalFrames}\ntime: ${
                  Math.round((time + Number.EPSILON) * 100) / 100
                } (${
                  (Math.round(10000 - ((intersectionRatio + Number.EPSILON) * 10000)) / 100)
                }%)`;
              }
              repeat--;
              requestAnimationFrame(() => updateAndMomentum());
            } else {
              video.currentTime = time;
            }
          }
        }

      }
    }
  });
};

app.showReferralBanner = function () {
  const queryParams = new URLSearchParams(location.search);
  const referral = queryParams.get('utm_source');

  if (!referral) {
    return;
  }

  const activeBanner = document.getElementById(`banner_${referral}`);

  if (activeBanner) {
    document.getElementById('referralBannerContainer').hidden = false;
    activeBanner.hidden = false;
  }
}

document.addEventListener('DOMContentLoaded', () => app.init());
