const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

let player, cursors, stars, blueStars, score = 0, scoreText;
let enemies, bullets, lastFired = 0;

const game = new Phaser.Game(config);

function preload() {
  this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');
  this.load.image('star', 'https://labs.phaser.io/assets/sprites/star.png');
  this.load.image('blueStar', 'https://labs.phaser.io/assets/sprites/blue_ball.png');
  this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/red_ball.png');
  this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/bullet.png');
  this.load.spritesheet('dude',
    'https://labs.phaser.io/assets/sprites/dude.png',
    { frameWidth: 32, frameHeight: 48 }
  );
}

function create() {
  const platforms = this.physics.add.staticGroup();
  platforms.create(400, 580, 'ground').setScale(2).refreshBody();
  platforms.create(600, 450, 'ground');
  platforms.create(50, 300, 'ground');
  platforms.create(750, 220, 'ground');

  player = this.physics.add.sprite(100, 450, 'dude');
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'turn',
    frames: [ { key: 'dude', frame: 4 } ],
    frameRate: 20
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  cursors = this.input.keyboard.createCursorKeys();
  this.input.keyboard.on('keydown-SPACE', shoot, this);

  stars = this.physics.add.group({
    key: 'star',
    repeat: 5,
    setXY: { x: 12, y: 0, stepX: 120 }
  });
  blueStars = this.physics.add.group({
    key: 'blueStar',
    repeat: 2,
    setXY: { x: 60, y: 0, stepX: 200 }
  });

  stars.children.iterate(child => child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)));
  blueStars.children.iterate(child => child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)));

  scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#fff' });

  enemies = this.physics.add.group();
  enemies.create(400, 100, 'enemy');
  enemies.create(600, 100, 'enemy');
  enemies.children.iterate(enemy => {
    enemy.setVelocityX(100);
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
  });

  bullets = this.physics.add.group();

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(blueStars, platforms);
  this.physics.add.collider(enemies, platforms);
  this.physics.add.collider(bullets, platforms, bullet => bullet.destroy());

  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.overlap(player, blueStars, collectBlueStar, null, this);
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('left', true);
    player.flipX = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('right', true);
    player.flipX = false;
  } else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);
}

function collectBlueStar(player, star) {
  star.disableBody(true, true);
  score += 20;
  scoreText.setText('Score: ' + score);
}

function shoot() {
  if (this.time.now < lastFired + 300) return;

  const bullet = bullets.create(player.x, player.y, 'bullet');
  bullet.setVelocityX(player.flipX ? -400 : 400);
  bullet.body.allowGravity = false;
  lastFired = this.time.now;
}

function hitEnemy(bullet, enemy) {
  bullet.destroy();
  enemy.destroy();
  score += 30;
  scoreText.setText('Score: ' + score);
}
