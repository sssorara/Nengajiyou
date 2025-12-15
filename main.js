
// 年賀状データのリスト
const cards = [
  // 1枚目
  {
    front: "./assets/card1_front.png", // 表面の画像パス
    back: "./assets/card1_back.png",   // 裏面の画像パス
    date: "2025年12月15日",
    author: "Taro Yamada"
  },
  // 2枚目
  {
    front: "./assets/card2_front.png",
    back: "./assets/card2_back.png",
    date: "2025年12月16日",
    author: "Hanako Suzuki"
  },
];

let currentIndex = 0; // 現在表示しているカードの番号（0からスタート）
let isAnimating = false; // アニメーション中かどうか

// HTMLの要素を取得（操作するために必要）
const cardElement = document.getElementById("card");      // カード全体
const imgFront = document.getElementById("img-front");    // 表の画像
const imgBack = document.getElementById("img-back");      // 裏の画像
const prevBtn = document.getElementById("prev-btn");      // 左の矢印
const nextBtn = document.getElementById("next-btn");      // 右の矢印

// モーダル関連の要素
const infoModal = document.getElementById("info-modal");
const closeModal = document.getElementById("close-modal");
const infoDate = document.getElementById("info-date");
const infoAuthor = document.getElementById("info-author");

// カードの画像を更新する関数
function updateCard(index) {
  const data = cards[index];
  imgFront.src = data.front; // 表の画像をセット
  imgBack.src = data.back;   // 裏の画像をセット
}

// 最初に一度実行して、初期状態を表示
updateCard(currentIndex);

// ▼▼ ナビゲーション（矢印）の処理 + アニメーション ▼▼

// 左矢印がクリックされたとき (前のカードへ)
prevBtn.addEventListener("click", () => {
  if (isAnimating) return; // アニメーション中はクリック無効
  isAnimating = true;

  // 1. 今の画像が右へ消えるアニメーション
  cardElement.classList.add("slide-out-right");

  // 0.5秒後に画像入れ替え & 新しい画像が左から入る
  setTimeout(() => {
    // 番号を1つ減らす
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCard(currentIndex);

    cardElement.classList.remove("slide-out-right");
    cardElement.classList.add("slide-in-left");

    // アニメーション完了後の処理
    setTimeout(() => {
      cardElement.classList.remove("slide-in-left");
      isAnimating = false;
    }, 500); // CSSのアニメーション時間と合わせる
  }, 500);
});

// 右矢印がクリックされたとき (次のカードへ)
nextBtn.addEventListener("click", () => {
  if (isAnimating) return;
  isAnimating = true;

  // 1. 今の画像が左へ消えるアニメーション
  cardElement.classList.add("slide-out-left");

  // 0.5秒後に画像入れ替え & 新しい画像が右から入る
  setTimeout(() => {
    // 番号を1つ増やす
    currentIndex = (currentIndex + 1) % cards.length;
    updateCard(currentIndex);

    cardElement.classList.remove("slide-out-left");
    cardElement.classList.add("slide-in-right");

    // アニメーション完了後の処理
    setTimeout(() => {
      cardElement.classList.remove("slide-in-right");
      isAnimating = false;
    }, 500);
  }, 500);
});

// ▼▼ モーダル（作品情報）の処理 ▼▼

// カードをクリックしたらモーダルを開く
// ※ドラッグ（回転操作）と区別するため、少し工夫してもいいですが、単純にclickで実装します
cardElement.addEventListener("click", () => {
  const data = cards[currentIndex];
  infoDate.textContent = data.date;
  infoAuthor.textContent = data.author;
  infoModal.showModal(); // showModal()を使うと::backdropが効く
});

// 閉じるボタン
closeModal.addEventListener("click", (e) => {
  e.stopPropagation(); // 親要素(card)への伝播を防ぐ（念のため）
  infoModal.close();
});

// モーダルの背景をクリックしたら閉じる
infoModal.addEventListener("click", (e) => {
  const rect = infoModal.getBoundingClientRect();
  // クリック位置がモーダルの外側か判定
  if (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  ) {
    infoModal.close();
  }
});


// ▼▼ マウスの動きでカードを回転させる処理 ▼▼
// 画面の中央を基準に、マウスの位置によって角度を計算します

window.addEventListener("mousemove", (e) => {
  // モーダルが開いているときは回転させない
  if (infoModal.open) return;

  const x = e.clientX; // マウスの横位置（X座標）
  const width = window.innerWidth; // 画面の横幅

  // 画面の左端が0、右端が1になるように計算
  const normalizedX = x / width;

  // 角度に変換（-180度 〜 180度）
  // 0.5（中央）のときに0度になるように調整
  const rotationY = (normalizedX - 0.5) * 360;

  // 少しだけ上下にも傾ける（リアリティのため）
  const y = e.clientY;
  const height = window.innerHeight;
  const normalizedY = y / height;
  const rotationX = (0.5 - normalizedY) * 20; // -10度 〜 10度

  // 計算した角度をカードに適用
  // アニメーションクラスがついているときはスタイル上書きを避ける（チラつき防止）
  if (!isAnimating) {
    cardElement.style.transform = `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`;
  }
});

// ▼▼（おまけ）スマホなどのタッチ操作対応 ▼▼
window.addEventListener("touchmove", (e) => {
  if (infoModal.open) return;
  const x = e.touches[0].clientX;
  const width = window.innerWidth;
  const normalizedX = x / width;
  const rotationY = (normalizedX - 0.5) * 360;

  if (!isAnimating) {
    cardElement.style.transform = `rotateY(${rotationY}deg)`;
  }
});


// ▼▼ 紙吹雪（Confetti）の実装 ▼▼
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");

// キャンバスサイズをウィンドウに合わせる
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas(); // 初期化時にも実行

// 紙吹雪の破片クラス
class Particle {
  constructor() {
    this.init();
  }

  init() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height - canvas.height; // 画面の上からスタート
    this.size = Math.random() * 10 + 5; // 大きさ 5~15px
    this.speedY = Math.random() * 2 + 1; // 落ちる速度
    this.speedX = Math.random() * 2 - 1; // 横揺れ速度
    this.color = this.getRandomColor();
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 2 - 1;
  }

  getRandomColor() {
    const colors = [
      "#fff",    // 白
      "#ffd700", // 金
      "#ffb6c1", // 薄いピンク
      "#f0e68c", // カーキ（和風な黄色）
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;

    // 画面下に到達したらリセット（上に戻す）
    if (this.y > canvas.height) {
      this.init();
      this.y = -20; // 画面の少し上から再開
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

// 破片をたくさん作る
const particles = [];
const particleCount = 100; // 紙吹雪の数
for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

// アニメーションループ
function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animateConfetti);
}

animateConfetti(); // アニメーション開始
