class Card {
  constructor(mana, health, attack) {
    this.mana = mana; // 魔力水晶
    this.health = health; // 血量
    this.attack = attack; // 攻擊力
    this.init_h = health; // 卡片預設血量
    this.init_a = attack; // 卡片預設攻擊力
  }

  // ======================================================

  attackCalc(data) {
    const { a } = data;
    this.health = this.health - a;
    if (this.health <= 0) this.onDeathrattle();
    return;
  }

  // ======================================================

  onBattlecry() {}

  onWake() {}

  onAttackEnd(a) {
    this.attackCalc({ a });
  }

  onAttackedEnd(a) {
    this.attackCalc({ a });
  }

  onKilling() {}

  onDeathrattle() {
    // console.log("dead");
    return;
  }
}

var p = new Card(2, 6, 1);
var p2 = new Card(2, 7, 4);

// console.log(p);
p.onAttackEnd(4);
// console.log(p.health);
p.onAttackEnd(1);
// console.log(p.health);
p.onAttackEnd(1);
// console.log(p.health);

// deck 牌組 opponent 對手 hero 英雄 mana crystals 魔力水晶

// Free
// Common
// Rare
// Epic
// Legendary
