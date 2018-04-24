// forked from cx20's '[WebGL] Grimoire.js + OimoPhysics.js で箱にボールを入れてみるテスト（改）' http://jsdo.it/cx20/eg5p
// forked from cx20's '[WebGL] Grimoire.js + OimoPhysics.js で箱にボールを入れてみるテスト（調整中）' http://jsdo.it/cx20/2t2l
// forked from cx20's '[WebGL] Grimoire.js + Oimo.js で箱にボールを入れてみるテスト（調整中）' http://jsdo.it/cx20/0fsp
// forked from cx20's '[WebGL] Grimoire.js で Oimo.js を試してみるテスト（その４改）' http://jsdo.it/cx20/sRhd
// forked from cx20's '[WebGL] Grimoire.js で Oimo.js を試してみるテスト（その４）' http://jsdo.it/cx20/ue3r
// forked from cx20's '[WebGL] Grimoire.js で Oimo.js を試してみるテスト（その３）' http://jsdo.it/cx20/G2wl
// forked from cx20's '[WebGL] Grimoire.js で Oimo.js を試してみるテスト（その２）' http://jsdo.it/cx20/sVc4
// forked from cx20's '[WebGL] Grimoire.js で Oimo.js を試してみるテスト' http://jsdo.it/cx20/kQ0F
// forked from cx20's '[WebGL] Grimoire.js で Cannon.js を試してみるテスト' http://jsdo.it/cx20/4xwo
// forked from cx20's '[WebGL] Grimoire.js を試してみるテスト（その４）（VBO編）' http://jsdo.it/cx20/swSy
// forked from cx20's '[WebGL] Grimoire.js を試してみるテスト（その３）（VBO編）' http://jsdo.it/cx20/YiRx
// forked from cx20's '[WebGL] Grimoire.js を試してみるテスト（その２）（VBO編）' http://jsdo.it/cx20/e3YN
// forked from cx20's '[WebGL] Grimoire.js を試してみるテスト（VBO編）' http://jsdo.it/cx20/iUdQ
// forked from cx20's '[WebGL] Grimoire.js を試してみるテスト' http://jsdo.it/cx20/4ZEB
// forked from cx20's '[WebGL] jThree を試してみるテスト' http://jsdo.it/cx20/Go5s

let counter = 0;
const Quaternion = gr.lib.math.Quaternion;
let stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const COIN_NAME = {
  COIN1: 'coin1',
  COIN2: 'coin2',
  COIN3: 'coin3',
  COIN4: 'coin4',
  COIN5: 'coin5',
};

const dataSet = [{
    material: '#mat1',
    scale: '1,0.3,1',
    coinName: COIN_NAME.COIN1,
  },
  {
    material: '#mat2',
    scale: '1,0.8,1',
    coinName: COIN_NAME.COIN2,
  },
  {
    material: '#mat3',
    scale: '1,1.8,1',
    coinName: COIN_NAME.COIN3,
  },
  {
    material: '#mat4',
    scale: '1,3,1',
    coinName: COIN_NAME.COIN4,
  },
  {
    material: '#mat5',
    scale: '2.6,1,2.6',
    coinName: COIN_NAME.COIN5,
  },
];

const score = {
  zenny: 300,
  startTime: 0,
  endTime: 0,
  clearTime: 0
};

function updateZenny(v) {
  console.log(score.zenny,v)
  if (score.zenny + v >= 0) {
    score.zenny += v;
    u('.score').text(`${score.zenny}z`);
  } else {
    swal({
      title: "お金が足りない",
      icon: "error",
      button: "OK",
    })
    throw new Error('おかねたりない');
  }
  if (score.zenny >= 5.0e+6) {
    score.endTime = +new Date();
    score.clearTime = score.endTime - score.startTime; // ms
    swal({
      title: "Good job!",
      text: `${score.clearTime / 1000}秒でコインカスケーダーをクリアしました`,
      icon: "success",
      button: "ツイートする",
    }).then((isOk) => {
      if (isOk) {
        location.href = `https://twitter.com/intent/tweet?text=${score.clearTime / 1000}秒でコインカスケーダーをクリアしました&hashtags=coincascader3`;
      } else {
        location.reload()
      }
    });
  }
}

function singlePut(targetCoinName) {
  randomPut(targetCoinName, 1, 0)
}

function randomPut(targetCoinName, count, maxDelay) {
  const scene = gr('#main')('scene').single();
  for (let i = 0; i < count; i++) {
    const x = -5 + Math.random() * 10;
    const y = 20 + Math.random() * 10;
    const z = -5 + Math.random() * 10;
    const t = Math.random() * maxDelay;
    const {
      material,
      scale,
      coinName
    } = dataSet.find(o => o.coinName === targetCoinName)
    setTimeout(() => {
      scene.addChildByName('rigid-cylinder', {
        material,
        scale,
        coinName,
        position: [x, y, z],
      });
    }, t);
  }
}

gr(function () {
  swal({
    title: "Coin Cascader 3",
    icon: "info",
    button: "ゲームを始める",
  }).then(() => {
    score.startTime = +new Date();
    randomPut(COIN_NAME.COIN1, 40, 5000)
  })
});

gr.register(() => {
  gr.registerComponent('OimoScene', {
    attributes: {},
    $awake() {
      this.world = new OIMO.World();
      this.world.gravity = new OIMO.Vec3(0, -9.80665, 0);
    },
    $update() {
      stats.begin();
      this.world.step(1 / 30);
      stats.end();
    }
  });

  gr.overrideDeclaration('scene', ['OimoScene']);

  gr.registerComponent('Rigid', {
    attributes: {
      shape: {
        default: 'box',
        converter: 'String'
      },
      move: {
        converter: 'Boolean',
        default: true
      }
    },
    $mount() {
      this.__bindAttributes();
      this.transform = this.node.getComponent('Transform');
      const p = this.transform.position;
      const r = this.transform.rotation;
      const s = this.transform.scale;
      const oimoScene = this.node.getComponentInAncestor('OimoScene');
      const shapec = new OIMO.ShapeConfig();
      if (this.shape === 'box') {
        shapec.geometry = new OIMO.BoxGeometry(new OIMO.Vec3(s.X, s.Y, s.Z));
      } else {
        shapec.geometry = new OIMO.CylinderGeometry(new OIMO.Vec3(s.X, s.Y, s.Z));
      }
      const bodyc = new OIMO.RigidBodyConfig();
      bodyc.type = this.move ? OIMO.RigidBodyType.DYNAMIC : OIMO.RigidBodyType.STATIC;
      bodyc.position = new OIMO.Vec3(p.X, p.Y, p.Z);
      this.body = new OIMO.RigidBody(bodyc);
      this.body.setRotationXyz(new OIMO.Vec3(r.X, r.Y, r.Z));
      this.body.addShape(new OIMO.Shape(shapec));
      oimoScene.world.addRigidBody(this.body);
    },
    $update() {
      if (this.node.getAttribute('id') === 'floor') {
        const ary = this.node.getAttribute('position').rawElements;
        this.body.setPosition(new OIMO.Vec3(ary[0], ary[1], ary[2]));
      }
      const p = this.body.getPosition();
      this.transform.setAttribute('position', [p.x, p.y, p.z]);
      const r = this.body.getOrientation();
      this.transform.setAttribute('rotation', new Quaternion([r.x, r.y, r.z, r.w]));
      if (p.y < -10) {
        if (-1.6 <= p.x && p.x <= +1.6 && 10 <= p.z && p.z <= 19) {
          switch (this.node.getAttribute('coinName')) {
            case COIN_NAME.COIN1:
              randomPut(COIN_NAME.COIN1, 4, 2000);
              randomPut(COIN_NAME.COIN2, 2, 2000);
              updateZenny(10);
              break;
            case COIN_NAME.COIN2:
              randomPut(COIN_NAME.COIN1, 2, 2000);
              randomPut(COIN_NAME.COIN2, 4, 2000);
              randomPut(COIN_NAME.COIN3, 2, 2000);
              updateZenny(100);
              break;
            case COIN_NAME.COIN3:
              randomPut(COIN_NAME.COIN2, 5, 2000);
              randomPut(COIN_NAME.COIN3, 6, 2000);
              randomPut(COIN_NAME.COIN4, 3, 2000);
              updateZenny(1000);
              break;
            case COIN_NAME.COIN4:
              randomPut(COIN_NAME.COIN1, 3, 2000);
              randomPut(COIN_NAME.COIN2, 3, 2000);
              randomPut(COIN_NAME.COIN3, 12, 2000);
              randomPut(COIN_NAME.COIN4, 8, 2000);
              randomPut(COIN_NAME.COIN5, 3, 2000);
              updateZenny(10000);
              break;
            case COIN_NAME.COIN5:
              randomPut(COIN_NAME.COIN1, 20, 2000);
              randomPut(COIN_NAME.COIN2, 20, 2000);
              randomPut(COIN_NAME.COIN3, 40, 2000);
              randomPut(COIN_NAME.COIN4, 30, 2000);
              randomPut(COIN_NAME.COIN5, 30, 2000);
              updateZenny(100000);
              break;
          }
          this.node.remove();
        }
      }
    }
  });

  const Vector3 = gr.lib.math.Vector3;
  gr.registerComponent('Wave', {
    attributes: {
      center: {
        default: '0, 0, 0',
        converter: 'Vector3',
      },
      speed: {
        default: 0.03,
        converter: 'Number',
      },
      coefficient: {
        default: 1,
        converter: 'Number',
      },
      amplitude: {
        default: 1,
        converter: 'Number',
      },
    },
    $awake() {
      this._transform = this.node.getComponent('Transform');
    },
    $mount() {
      this.t = 0;
      var d = this.node.getAttribute('position').subtractWith(this.getAttribute('center'));
      this.distance = d.magnitude;
      this.basePosition = this._transform.position;
    },
    $update() {
      this.t += this.getAttribute('speed');
      this._transform.position = this.basePosition
        .addWith(new Vector3(0, 0, this.getAttribute('amplitude') * Math.sin(this.t + this.distance * this.getAttribute('coefficient'))));
    },
  });

  gr.registerNode('rigid-cube', ['Rigid'], {
    geometry: 'cube',
    shape: 'box',
    scale: [1, 1, 1],
    transparent: 'false'
  }, 'mesh');

  gr.registerNode('rigid-cylinder', ['Rigid'], {
    geometry: 'cylinder',
    scale: [1, 1, 1],
    transparent: 'false'
  }, 'mesh');
});

// u(() => {}) いらないのか
u('.coin1').on('click', () => {
  try {
    updateZenny(-30);
    singlePut(COIN_NAME.COIN1);
  } catch (e) {}
});
u('.coin2').on('click', () => {
  try {
    updateZenny(-300);
    singlePut(COIN_NAME.COIN2);
  } catch (e) { }
});
u('.coin3').on('click', () => {
  try {
    updateZenny(-3000);
    singlePut(COIN_NAME.COIN3);
  } catch (e) { }
});
u('.coin4').on('click', () => {
  try {
    updateZenny(-30000);
    singlePut(COIN_NAME.COIN4);
  } catch (e) { }
});
u('.coin5').on('click', () => {
  try {
    updateZenny(-300000);
    singlePut(COIN_NAME.COIN5);
  } catch (e) { }
});

u('.buy-coin1').on('click', () => {
  updateZenny(300);
});
u('.buy-coin2').on('click', () => {
  updateZenny(3000);
});
u('.buy-coin3').on('click', () => {
  updateZenny(30000);
});
u('.buy-coin4').on('click', () => {
  updateZenny(300000);
});
