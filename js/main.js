/**
 * BẢO TÀNG BÁO CHÍ VIỆT NAM - VIETNAM PRESS MUSEUM
 * Interactive Features & Audio Tour Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initAudioGuide();
  initGalleryFilter();
  initModalLightbox();
  initBookingForm();
  initHistoryQuiz();
  initScrollAnimations();
});

/* ==========================================================================
   1. NAVIGATION & SCROLL
   ========================================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = menuToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close menu on link click
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = menuToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ==========================================================================
   2. INTERACTIVE AUDIO GUIDE ENGINE (With Web Audio Ambient Synthesizer)
   ========================================================================== */
const audioTracks = [
  {
    id: 'bac-ho',
    title: 'Lời dạy của Bác Hồ về Báo chí Cách mạng',
    subtitle: 'Không gian tưởng niệm Chủ tịch Hồ Chí Minh',
    duration: 125,
    text: 'Cán bộ báo chí cũng là chiến sĩ cách mạng. Cây bút, trang giấy là vũ khí sắc bén của họ. Báo chí là tiếng nói của Đảng, của nhân dân, phụng sự độc lập tự do của Tổ quốc.'
  },
  {
    id: 'ngoi-but',
    title: 'Biểu tượng Ngòi Bút Ánh Sáng Kỳ Vĩ',
    subtitle: 'Đại sảnh Bảo tàng Báo chí',
    duration: 140,
    text: 'Ngòi bút khổng lồ vươn cao được tạo nên từ tên hàng trăm cơ quan báo chí qua nhiều thời kỳ, hội tụ tinh thần dấn thân bất khuất và sứ mệnh soi sáng của người làm báo.'
  },
  {
    id: 'gia-dinh-bao',
    title: 'Gia Định Báo (1865) - Bình minh Báo chí Quốc ngữ',
    subtitle: 'Gian trưng bày 1865 - 1925',
    duration: 155,
    text: 'Gia Định Báo ra đời năm 1865 tại Sài Gòn, là mốc son mở đầu cho lịch sử báo chí chữ Quốc ngữ tại Việt Nam, gắn liền với tên tuổi học giả tiên phong Trương Vĩnh Ký.'
  },
  {
    id: 'chien-truong',
    title: 'Máy ảnh Minolta & Kỷ vật Phóng viên Chiến trường',
    subtitle: 'Gian trưng bày Kỷ vật Kháng chiến',
    duration: 130,
    text: 'Những chiếc máy ảnh, đài bán dẫn và cuốn sổ tay nhuốm màu khói lửa đã theo chân các nhà báo chiến sĩ vào tận chiến trường ác liệt vì một nền độc lập dân tộc.'
  },
  {
    id: 'boston-letter',
    title: 'The Boston News-Letter (1704) & Báo Annonces (1773)',
    subtitle: 'Gian trưng bày Báo chí Thế giới',
    duration: 110,
    text: 'Bộ sưu tập đối chiếu các bản in báo chí cổ xưa quý hiếm trên thế giới, khẳng định dòng chảy bất tận của thông tin trong tiến trình văn minh nhân loại.'
  }
];

let currentTrackIndex = 0;
let isPlaying = false;
let audioTimer = null;
let currentSeconds = 0;
let audioCtx = null;
let ambientOscillator = null;

function initAudioGuide() {
  const playBtn = document.getElementById('audioPlayBtn');
  const trackSelector = document.getElementById('audioTrackSelector');
  const progressFill = document.getElementById('audioProgressFill');
  const progressBar = document.getElementById('audioProgressBar');
  const timeDisplay = document.getElementById('audioTimeDisplay');
  const trackTitle = document.getElementById('audioTrackTitle');
  const trackSub = document.getElementById('audioTrackSub');

  if (!playBtn) return;

  function updateTrackDisplay() {
    const track = audioTracks[currentTrackIndex];
    if (trackTitle) trackTitle.textContent = track.title;
    if (trackSub) trackSub.textContent = track.subtitle;
    if (trackSelector) trackSelector.value = track.id;
    currentSeconds = 0;
    updateProgressUI();
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function updateProgressUI() {
    const track = audioTracks[currentTrackIndex];
    const pct = (currentSeconds / track.duration) * 100;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (timeDisplay) timeDisplay.textContent = `${formatTime(currentSeconds)} / ${formatTime(track.duration)}`;
  }

  // Soft museum ambiance tone using Web Audio API
  function startWebAudioTone() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (!ambientOscillator) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3 calm note
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime); // very gentle background warmth
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        ambientOscillator = { osc, gain };
      }
    } catch (e) {
      console.log('AudioContext initialized');
    }
  }

  function stopWebAudioTone() {
    if (ambientOscillator) {
      try {
        ambientOscillator.osc.stop();
        ambientOscillator.osc.disconnect();
      } catch (e) {}
      ambientOscillator = null;
    }
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    const icon = playBtn.querySelector('i');

    if (isPlaying) {
      if (icon) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
      }
      playBtn.style.boxShadow = '0 0 25px rgba(212, 175, 55, 0.6)';
      startWebAudioTone();

      // Read text using Web Speech API if supported
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(audioTracks[currentTrackIndex].text);
        utter.lang = 'vi-VN';
        utter.rate = 0.92;
        utter.pitch = 1.0;
        utter.onend = () => {
          // Keep timer going or loop
        };
        window.speechSynthesis.speak(utter);
      }

      audioTimer = setInterval(() => {
        const track = audioTracks[currentTrackIndex];
        if (currentSeconds < track.duration) {
          currentSeconds++;
          updateProgressUI();
        } else {
          // Track ended
          currentSeconds = 0;
          currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length;
          updateTrackDisplay();
        }
      }, 1000);
    } else {
      if (icon) {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
      }
      playBtn.style.boxShadow = '';
      clearInterval(audioTimer);
      stopWebAudioTone();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  playBtn.addEventListener('click', togglePlay);

  if (trackSelector) {
    trackSelector.addEventListener('change', (e) => {
      const idx = audioTracks.findIndex(t => t.id === e.target.value);
      if (idx !== -1) {
        currentTrackIndex = idx;
        const wasPlaying = isPlaying;
        if (isPlaying) togglePlay();
        updateTrackDisplay();
        if (wasPlaying) togglePlay();
      }
    });
  }

  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickPos = (e.clientX - rect.left) / rect.width;
      const track = audioTracks[currentTrackIndex];
      currentSeconds = Math.floor(clickPos * track.duration);
      updateProgressUI();
    });
  }

  // Hook buttons that trigger audio guide
  document.querySelectorAll('[data-play-audio]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const trackId = btn.getAttribute('data-play-audio');
      const idx = audioTracks.findIndex(t => t.id === trackId);
      if (idx !== -1) {
        currentTrackIndex = idx;
        updateTrackDisplay();
        if (!isPlaying) togglePlay();
        // Scroll smoothly to audio bar
        const audioBanner = document.querySelector('.audio-player-banner');
        if (audioBanner) {
          audioBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  });

  updateTrackDisplay();
}

/* ==========================================================================
   3. GALLERY FILTERING
   ========================================================================== */
function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.gallery-card[data-category]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filterVal === 'all' || cat === filterVal) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* ==========================================================================
   4. ARTIFACT LIGHTBOX MODAL DATA & HANDLER
   ========================================================================== */
const artifactDetails = {
  'DSCF6081': {
    title: 'Biểu Tượng Ngòi Bút Ánh Sáng',
    period: 'Đại Sảnh Danh Dự • Tác Phẩm Điêu Khắc Đương Đại',
    category: 'Biểu Tượng Tôn Vinh',
    image: 'assets/images/optimized/DSCF6081.jpg',
    desc: 'Điêu khắc ánh sáng hình ngọn bút ngọc uy nghiêm vươn thẳng lên bầu trời. Thân ngòi bút được ghép tinh xảo từ tên hàng trăm tờ báo, tạp chí và cơ quan truyền thông qua các giai đoạn lịch sử nước nhà: Gia Định Báo, Tiếng Dân, Báo Lao Động, Tiền Phong, Thông Tấn Xã Việt Nam, Đài Tiếng Nói Việt Nam, Báo Nhân Dân, Báo Quân Đội Nhân Dân... Tác phẩm biểu trưng cho sức mạnh tư tưởng, ngọn đèn soi sáng công lý và lòng trung thành phụng sự dân tộc.',
    specs: [
      { label: 'Chất liệu', val: 'Kính quang học & Hợp kim mạ vàng' },
      { label: 'Kích thước', val: 'Cao 4.5m x Rộng 2.8m' },
      { label: 'Vị trí trưng bày', val: 'Đại sảnh Bảo tàng Báo chí' },
      { label: 'Ý nghĩa', val: 'Hội tụ tinh hoa hơn 150 năm báo chí' }
    ],
    audioId: 'ngoi-but'
  },
  'DSCF6084': {
    title: 'Lời Huấn Thị Bất Hủ Của Chủ Tịch Hồ Chí Minh',
    period: 'Tư Tưởng Báo Chí Cách Mạng • Khắc Chữ Kim Loại Mạ Vàng',
    category: 'Tư Tưởng Lãnh Tụ',
    image: 'assets/images/optimized/DSCF6084.jpg',
    desc: '"Cán bộ báo chí cũng là chiến sĩ cách mạng. Cây bút, trang giấy là vũ khí sắc bén của họ." - Lời dạy thiêng liêng của Bác Hồ được đúc chữ nổi mạ vàng trang trọng trên vách gỗ quý, phía dưới là tượng chân dung Bác bằng đồng đỏ. Lời dạy là kim chỉ nam soi đường cho nhiều thế hệ người làm báo cách mạng.',
    specs: [
      { label: 'Tác giả', val: 'Chủ tịch Hồ Chí Minh (1890 - 1969)' },
      { label: 'Chất liệu tượng', val: 'Đồng đúc nguyên khối' },
      { label: 'Khẩu hiệu', val: 'Hợp kim mạ vàng trên gỗ sồi tự nhiên' },
      { label: 'Bối cảnh', val: 'Thư gửi các nhà báo (1962)' }
    ],
    audioId: 'bac-ho'
  },
  'DSCF6088': {
    title: 'Không Gian Tưởng Niệm Chủ Tịch Hồ Chí Minh',
    period: 'Người Sáng Lập Báo Chí Cách Mạng Việt Nam',
    category: 'Không Gian Chuyên Đề',
    image: 'assets/images/optimized/DSCF6088.jpg',
    desc: 'Toàn cảnh không gian trang nghiêm thờ và tưởng niệm Chủ tịch Hồ Chí Minh - Người sáng lập tờ báo Thanh Niên ngày 21/6/1925 tại Quảng Châu, đặt nền móng khai sinh nền Báo chí Cách mạng Việt Nam. Ánh sáng ấm áp từ đèn tiêu điểm làm nổi bật thần thái của Bác cùng những vần chữ vàng bất tử.',
    specs: [
      { label: 'Thiết kế', val: 'Không gian tưởng niệm chuyên đề' },
      { label: 'Vật liệu', val: 'Gỗ tự nhiên chống ẩm cao cấp' },
      { label: 'Không gian', val: 'Gian trung tâm Tầng 1' },
      { label: 'Điểm nhấn', val: 'Tượng đồng bán thân & Chiếu sáng nghệ thuật' }
    ],
    audioId: 'bac-ho'
  },
  'DSCF6083': {
    title: 'Biển Định Vị: Báo Chí Việt Nam 1865 – 1925',
    period: 'Giai Đoạn Khởi Thủy (1865 – 1925)',
    category: 'Gian Trưng Bày',
    image: 'assets/images/optimized/DSCF6083.jpg',
    desc: 'Biển chuyên đề sắc đỏ sơn mài sang trọng đánh dấu thời kỳ khởi nguồn của nền báo chí Việt Nam từ năm 1865 (với sự ra đời của Gia Định Báo) đến năm 1925 (khi Báo Thanh Niên xuất bản số đầu tiên). Đây là thời kỳ chuyển dịch ngôn ngữ từ Hán Nôm sang chữ Quốc ngữ, kiến tạo nền văn hóa đọc hiện đại.',
    specs: [
      { label: 'Chất liệu', val: 'Mica phủ men đỏ mờ công nghệ cao' },
      { label: 'Niên đại tái hiện', val: '1865 - 1925 (60 năm vàng son)' },
      { label: 'Nội dung', val: 'Mở đầu kỷ nguyên báo chí chữ Quốc ngữ' },
      { label: 'Vị trí', val: 'Cổng vào khu trưng bày Cận đại' }
    ],
    audioId: 'gia-dinh-bao'
  },
  'DSCF6122': {
    title: 'Gia Định Báo Số 4 (Ngày 15.7.1865)',
    period: 'Tờ Báo Chữ Quốc Ngữ Đầu Tiên Của Nước Ta',
    category: 'Ấn Phẩm Lịch Sử Quý Hiếm',
    image: 'assets/images/optimized/DSCF6122.jpg',
    desc: 'Bản in tờ Gia Định Báo số 4 ra ngày 15 tháng 7 năm 1865 (nguồn: Thư viện Trường Ngôn ngữ & Văn minh Paris). Tờ báo ghi lại thông cáo công vụ, giá cả thị trường và các bài viết cổ vũ lối sống văn minh. Nhà báo, học giả Trương Vĩnh Ký (1837-1898) là vị chủ nhiệm tài ba đưa tờ báo đến sâu rộng trong quần chúng nhân dân.',
    specs: [
      { label: 'Chủ nhiệm đầu tiên', val: 'Học giả Trương Vĩnh Ký' },
      { label: 'Nơi xuất bản', val: 'Sài Gòn - Gia Định' },
      { label: 'Ngôn ngữ', val: 'Chữ Quốc ngữ kết hợp chữ Hán' },
      { label: 'Tình trạng bảo tồn', val: 'Phục dựng nguyên bản tỷ lệ 1:1' }
    ],
    audioId: 'gia-dinh-bao'
  },
  'DSCF6123': {
    title: 'Bảng Dấu Mốc Báo Chí Cổ Tiêu Biểu',
    period: 'Đông Dương Tạp Chí, Đại Nam Đồng Văn, Nam Kỳ Địa Phận, Nữ Giới Chung',
    category: 'Tài Liệu Lưu Trữ',
    image: 'assets/images/optimized/DSCF6123.jpg',
    desc: 'Bảng trưng bày các tờ báo tiêu biểu đầu thế kỷ XX: Đông Dương Tạp Chí (1913-1919) do Nguyễn Văn Vĩnh làm chủ bút; Đại Nam Đồng Văn Nhật Báo (1892-1907); Nam Kỳ Địa Phận (1908-1945); Nữ Giới Chung (1918-1919) - tờ báo đầu tiên dành riêng cho phụ nữ Việt Nam do nữ sĩ Sương Nguyệt Anh làm chủ bút.',
    specs: [
      { label: 'Các ấn phẩm', val: '5 tờ báo kinh điển đầu thế kỷ XX' },
      { label: 'Điểm đặc sắc', val: 'Có tờ báo phụ nữ đầu tiên (Nữ Giới Chung)' },
      { label: 'Đơn vị lưu trữ', val: 'Thư viện Khoa học Tổng hợp TP.HCM' },
      { label: 'Chủ đề', val: 'Canh tân văn hóa & truyền thông tiến bộ' }
    ],
    audioId: 'gia-dinh-bao'
  },
  'DSCF6115': {
    title: 'Làng Lai Xá & Ký Ức Hà Nội Đầu Thế Kỷ XX',
    period: 'Cái Nôi Nghề Ảnh Việt Nam • Danh Nhân Đặng Huy Trứ',
    category: 'Văn Hóa & Ký Ức',
    image: 'assets/images/optimized/DSCF6115.jpg',
    desc: 'Gian trưng bày tôn vinh làng Lai Xá (Hoài Đức, Hà Nội) - nơi sản sinh ra những thế hệ nghệ nhân nhiếp ảnh lừng danh; cùng danh nhân Đặng Huy Trứ (người đầu tiên mang nghề ảnh về Việt Nam năm 1869). Không gian tái hiện hình ảnh Hà Nội xưa qua ống kính những thợ ảnh tiên phong.',
    specs: [
      { label: 'Địa danh', val: 'Làng Lai Xá, Kim Chung, Hoài Đức, Hà Nội' },
      { label: 'Nhân vật lịch sử', val: 'Cụ Đặng Huy Trứ & Cụ Nguyễn Đình Khánh' },
      { label: 'Tư liệu ảnh', val: 'Hà Nội thập niên 1900 - 1920' },
      { label: 'Vị trí', val: 'Phòng trưng bày Lịch sử Nhiếp ảnh Báo chí' }
    ],
    audioId: 'gia-dinh-bao'
  },
  'DSCF6254': {
    title: 'Huy Hiệu 60 Năm Tuổi Đảng & Đề Án Cách Mạng 1949',
    period: 'Kỷ Vật Nhà Báo Kháng Chiến Nguyễn Khắc Cần',
    category: 'Kỷ Vật Cách Mạng',
    image: 'assets/images/optimized/DSCF6254.jpg',
    desc: 'Huy hiệu 60 năm tuổi Đảng của nhà báo lão thành Nguyễn Khắc Cần (Đài Tiếng nói Nhân dân TP. Hồ Chí Minh), cùng cuốn sách đề án quý giá "Cách Mạng Dân Chủ Mới Đông Dương" xuất bản năm 1949 tại Chiến khu Việt Bắc, cùng Điều lệ Đảng thời kỳ kháng chiến chống Pháp oanh liệt.',
    specs: [
      { label: 'Chủ sở hữu', val: 'Nhà báo Nguyễn Khắc Cần' },
      { label: 'Cơ quan', val: 'Đài Tiếng nói Nhân dân TP.HCM (VOH)' },
      { label: 'Niên đại hiện vật', val: 'Năm 1949 & Giai đoạn sau 1954' },
      { label: 'Tình trạng', val: 'Hiện vật gốc được trao tặng cho bảo tàng' }
    ],
    audioId: 'chien-truong'
  },
  'DSCF6255': {
    title: 'Máy Ảnh Minolta Hi-Matic SD & Đài Radio Chiến Trường',
    period: 'Trang Bị Tác Nghiệp Của Phóng Viên Tiền Tuyến',
    category: 'Phương Tiện Tác Nghiệp',
    image: 'assets/images/optimized/DSCF6255.jpg',
    desc: 'Chiếc máy ảnh phim Minolta Hi-Matic SD nhỏ gọn, đài radio bán dẫn vỏ da và sổ tay công tác nơi chiến trường ác liệt. Những công cụ này đã đồng hành cùng nhà báo xông pha dưới làn bom đạn, ghi lại những thước phim lịch sử hào hùng của cuộc kháng chiến thống nhất non sông.',
    specs: [
      { label: 'Thiết bị', val: 'Máy ảnh Minolta Hi-Matic SD (Nhật Bản)' },
      { label: 'Phụ kiện', val: 'Radio bán dẫn bắt sóng giải phóng, sổ tác nghiệp' },
      { label: 'Thời kỳ', val: 'Kháng chiến chống Mỹ cứu nước' },
      { label: 'Tình trạng', val: 'Nguyên bản, lưu giữ vết tích thời gian' }
    ],
    audioId: 'chien-truong'
  },
  'DSCF6257': {
    title: 'Bút, Sổ Ghi Chép Năm 1964 & Bản Thảo "Ký Ức Mậu Thân"',
    period: 'Kỷ Vật Của Nhà Báo Hoàng Tùng & Bùi Á (Báo Nhân Dân)',
    category: 'Bản Thảo & Giấy Tờ',
    image: 'assets/images/optimized/DSCF6257.jpg',
    desc: 'Bộ hiện vật vô giá: Bút và sổ ghi chép năm 1964 của nhà báo Hoàng Tùng (Tổng Biên tập Báo Nhân Dân); Thư gửi anh Sáu Mạnh của nhà báo Trần Bạch Đằng (02/02/1972); Thẻ đại biểu Quốc hội khóa VIII; và Bản thảo viết tay "Ký ức Mậu Thân" năm 1968 của nhà báo Bùi Á.',
    specs: [
      { label: 'Chủ nhân hiện vật', val: 'Nhà báo Hoàng Tùng, Trần Bạch Đằng, Bùi Á' },
      { label: 'Cơ quan', val: 'Báo Nhân Dân, Đài Tiếng nói Việt Nam' },
      { label: 'Niên đại', val: '1964 - 1987' },
      { label: 'Tài liệu độc bản', val: 'Bản thảo tay chép trận chiến Mậu Thân 1968' }
    ],
    audioId: 'chien-truong'
  },
  'DSCF6093': {
    title: 'The Boston News-Letter (Bản Tin Boston - 1704)',
    period: 'Tờ Báo Xuất Bản Liên Tục Đầu Tiên Của Châu Mỹ',
    category: 'Báo Chí Thế Giới',
    image: 'assets/images/optimized/DSCF6093.jpg',
    desc: 'Tờ The Boston News-Letter ra ngày 24.4.1704 tại Bắc Mỹ. Trung tâm Lưu trữ Lịch sử Massachusetts (Mỹ) công nhận đây là tờ báo xuất bản liên tục đầu tiên của châu Mỹ. Ấn bản được bảo tàng lưu giữ nhằm so sánh và giới thiệu tiến trình văn minh báo chí thế giới đến công chúng Việt Nam.',
    specs: [
      { label: 'Ngày xuất bản', val: '24 tháng 4 năm 1704' },
      { label: 'Địa điểm', val: 'Boston, Massachusetts, Bắc Mỹ' },
      { label: 'Ý nghĩa quốc tế', val: 'Tờ báo đầu tiên phát hành định kỳ châu Mỹ' },
      { label: 'Đơn vị xác nhận', val: 'Massachusetts Historical Society' }
    ],
    audioId: 'boston-letter'
  },
  'DSCF6114': {
    title: 'Báo Annonces, Affiches et Avis Divers (1773)',
    period: 'Tờ Báo Cổ Nhất Châu Phi • Xuất Bản Ngày 13.01.1773',
    category: 'Báo Chí Thế Giới',
    image: 'assets/images/optimized/DSCF6114.jpg',
    desc: 'Báo Annonces, Affiches et Avis Divers pour les Colonies des Isles de France et de Bourbon (Thông báo, áp phích, quảng cáo dành cho các thuộc địa quần đảo của Pháp và Bourbon), ra ngày 13.01.1773 tại Mauritius. Được tổ chức World Atlas đánh giá là tờ báo cổ nhất của toàn châu Phi.',
    specs: [
      { label: 'Ngày ra đời', val: '13 tháng 1 năm 1773' },
      { label: 'Địa danh', val: 'Quần đảo Mauritius, Ấn Độ Dương' },
      { label: 'Kỷ lục', val: 'Tờ báo cổ nhất lục địa châu Phi' },
      { label: 'Nguồn thẩm định', val: 'World Atlas' }
    ],
    audioId: 'boston-letter'
  }
};

function initModalLightbox() {
  const modal = document.getElementById('artifactModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const modalImg = document.getElementById('modalImg');
  const modalBadge = document.getElementById('modalBadge');
  const modalTitle = document.getElementById('modalTitle');
  const modalPeriod = document.getElementById('modalPeriod');
  const modalDesc = document.getElementById('modalDesc');
  const modalSpecs = document.getElementById('modalSpecs');
  const modalAudioBtn = document.getElementById('modalAudioBtn');

  if (!modal) return;

  function openModal(id) {
    const data = artifactDetails[id];
    if (!data) return;

    modalImg.src = data.image;
    modalImg.alt = data.title;
    modalBadge.textContent = data.category;
    modalTitle.textContent = data.title;
    modalPeriod.textContent = data.period;
    modalDesc.textContent = data.desc;

    // Build specs HTML
    modalSpecs.innerHTML = data.specs.map(s => `
      <div class="spec-row">
        <span class="spec-label">${s.label}:</span>
        <span class="spec-val">${s.val}</span>
      </div>
    `).join('');

    if (modalAudioBtn && data.audioId) {
      modalAudioBtn.setAttribute('data-play-audio', data.audioId);
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Open modal triggers
  document.querySelectorAll('[data-artifact-id]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const id = elem.getAttribute('data-artifact-id');
      openModal(id);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (modalAudioBtn) {
    modalAudioBtn.addEventListener('click', (e) => {
      const audioId = modalAudioBtn.getAttribute('data-play-audio');
      closeModal();
      const playBtn = document.querySelector(`[data-play-audio="${audioId}"]`);
      if (playBtn) playBtn.click();
    });
  }
}

/* ==========================================================================
   5. BOOKING TOUR FORM
   ========================================================================== */
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  const dateInput = document.getElementById('tourDate');
  const resultBox = document.getElementById('bookingResult');

  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const visitors = document.getElementById('visitorsCount').value;
      const date = document.getElementById('tourDate').value;
      const tourType = document.getElementById('tourType').value;

      if (!name || !phone || !date) {
        alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
        return;
      }

      const bookingCode = 'VPM-' + Math.floor(100000 + Math.random() * 900000);

      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `
          <div style="background: rgba(34, 197, 94, 0.15); border: 1px solid #22c55e; border-radius: 12px; padding: 1.5rem; color: #fff; text-align: left; animation: fadeIn 0.4s ease;">
            <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom: 0.8rem;">
              <span style="font-size: 1.6rem; color: #4ade80;">✓</span>
              <h4 style="font-size: 1.15rem; color: #86efac; margin:0;">Đặt Lịch Tham Quan Thành Công!</h4>
            </div>
            <p style="font-size: 0.9rem; color: #e2e8f0; margin-bottom: 0.5rem;">Cảm ơn <strong>${name}</strong> đã đặt lịch hẹn với Bảo tàng Báo chí Việt Nam.</p>
            <div style="background: rgba(0,0,0,0.4); padding: 0.8rem 1rem; border-radius: 8px; font-size: 0.85rem; margin: 0.8rem 0;">
              <div>• <strong>Mã phiếu tham quan:</strong> <span style="color:#fde047; font-weight:700;">${bookingCode}</span></div>
              <div>• <strong>Thời gian:</strong> ${date} | <strong>Số lượng:</strong> ${visitors} người</div>
              <div>• <strong>Hình thức:</strong> ${tourType}</div>
              <div>• <strong>Địa điểm:</strong> Tòa nhà Hội Nhà báo VN, Dương Đình Nghệ, Cầu Giấy, Hà Nội</div>
            </div>
            <p style="font-size: 0.8rem; color: #94a3b8; margin: 0;">Bộ phận lễ tân sẽ gọi điện tới số <strong>${phone}</strong> để xác nhận chi tiết trước 24h.</p>
          </div>
        `;
        form.reset();
      }
    });
  }
}

/* ==========================================================================
   6. INTERACTIVE HISTORY QUIZ
   ========================================================================== */
const quizQuestions = [
  {
    q: 'Tờ báo chữ Quốc ngữ đầu tiên xuất bản tại Việt Nam vào năm 1865 có tên là gì?',
    opts: ['Gia Định Báo', 'Thanh Niên', 'Đông Dương Tạp Chí', 'Tiếng Dân'],
    correct: 0,
    hint: 'Gia Định Báo ra mắt số 1 vào ngày 15/4/1865 tại Sài Gòn do Trương Vĩnh Ký làm chủ nhiệm.'
  },
  {
    q: 'Báo "Thanh Niên" - tờ báo mở đầu nền Báo chí Cách mạng Việt Nam do ai sáng lập vào ngày 21/6/1925?',
    opts: ['Học giả Trương Vĩnh Ký', 'Lãnh tụ Nguyễn Ái Quốc (Hồ Chí Minh)', 'Nhà chí sĩ Phan Bội Châu', 'Nhà văn Nguyễn Văn Vĩnh'],
    correct: 1,
    hint: 'Chủ tịch Hồ Chí Minh sáng lập báo Thanh Niên tại Quảng Châu, ngày 21/6 hàng năm trở thành Ngày Báo chí Cách mạng Việt Nam.'
  },
  {
    q: 'Tờ báo đầu tiên của phụ nữ Việt Nam do nữ sĩ Sương Nguyệt Anh làm chủ bút năm 1918 tên là gì?',
    opts: ['Phụ Nữ Tân Văn', 'Nữ Giới Chung', 'Nam Phong', 'Khai Hóa'],
    correct: 1,
    hint: 'Nữ Giới Chung ra đời năm 1918 tại Sài Gòn, là tờ báo đầu tiên đấu tranh cho nữ quyền và tri thức của phụ nữ.'
  }
];

let currentQuizIdx = 0;
let userScore = 0;

function initHistoryQuiz() {
  const qText = document.getElementById('quizQText');
  const optsContainer = document.getElementById('quizOpts');
  const feedback = document.getElementById('quizFeedback');
  const nextBtn = document.getElementById('quizNextBtn');
  const scoreBadge = document.getElementById('quizScoreBadge');

  if (!qText || !optsContainer) return;

  function renderQuizQuestion() {
    const item = quizQuestions[currentQuizIdx];
    qText.textContent = `Câu ${currentQuizIdx + 1}/${quizQuestions.length}: ${item.q}`;
    feedback.textContent = '';
    feedback.style.color = '';
    if (nextBtn) nextBtn.style.display = 'none';

    optsContainer.innerHTML = '';
    item.opts.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleQuizAnswer(idx, btn));
      optsContainer.appendChild(btn);
    });
  }

  function handleQuizAnswer(selectedIdx, clickedBtn) {
    const item = quizQuestions[currentQuizIdx];
    const buttons = optsContainer.querySelectorAll('.quiz-opt-btn');
    buttons.forEach(b => b.disabled = true);

    if (selectedIdx === item.correct) {
      clickedBtn.classList.add('correct');
      feedback.textContent = `🎉 Hoàn toàn chính xác! ${item.hint}`;
      feedback.style.color = '#86efac';
      userScore++;
    } else {
      clickedBtn.classList.add('incorrect');
      buttons[item.correct].classList.add('correct');
      feedback.textContent = `💡 Chưa chính xác. ${item.hint}`;
      feedback.style.color = '#fca5a5';
    }

    if (scoreBadge) {
      scoreBadge.textContent = `Điểm: ${userScore}/${quizQuestions.length}`;
    }

    if (nextBtn) {
      nextBtn.style.display = 'inline-block';
      if (currentQuizIdx === quizQuestions.length - 1) {
        nextBtn.textContent = 'Hoàn thành đố vui';
      } else {
        nextBtn.textContent = 'Câu hỏi tiếp theo →';
      }
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentQuizIdx < quizQuestions.length - 1) {
        currentQuizIdx++;
        renderQuizQuestion();
      } else {
        qText.textContent = `🎉 Bạn đã hoàn thành đố vui với ${userScore}/${quizQuestions.length} câu đúng!`;
        optsContainer.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 1.5rem; background: rgba(212, 175, 55, 0.15); border: 1px solid #d4af37; border-radius: 12px; color: #fff;">
            <h4 style="font-size: 1.25rem; color: #fbe29a; margin-bottom: 0.5rem;">Chứng nhận Am hiểu Lịch sử Báo chí</h4>
            <p style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 1rem;">Bạn có vốn hiểu biết rất sâu sắc về các dấu mốc báo chí Việt Nam và thế giới. Hãy ghé thăm Bảo tàng Báo chí để tự tay trải nghiệm các hiện vật gốc!</p>
            <button id="quizRestartBtn" class="btn-primary" style="display:inline-flex; margin:0 auto;">Làm lại đố vui</button>
          </div>
        `;
        feedback.textContent = '';
        nextBtn.style.display = 'none';

        document.getElementById('quizRestartBtn')?.addEventListener('click', () => {
          currentQuizIdx = 0;
          userScore = 0;
          if (scoreBadge) scoreBadge.textContent = 'Điểm: 0/3';
          renderQuizQuestion();
        });
      }
    });
  }

  renderQuizQuestion();
}

/* ==========================================================================
   7. SCROLL OBSERVER REVEAL ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.gallery-card, .stat-card, .timeline-node, .info-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}
