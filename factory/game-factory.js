class Game {
  constructor(name1, name2, deck1, deck2) {
    // deck: 抽牌的牌組, hand: 手牌, board: 牌桌上的手下
    this.p1 = {
      name: name1,
      health: 30,
      mana: 1,
      deck: deck1,
      hand: [],
      board: [],
      endOfMyTurn: false
    };
    this.p2 = {
      name: name2,
      health: 30,
      mana: 1,
      deck: deck2,
      hand: [],
      board: [],
      endOfMyTurn: false
    };
    // game state
    this.gs = {
      round: 0,
      turn: name1,
      isGameOver: false,
      winner: null,
      loser: null
    };
  }

  // ======================================================

  *onGameStart() {
    yield "added deck of p1";

    yield "added deck of p2";

    // 將牌堆中的前三張牌放入手牌
    var p1handArr = this.p1.deck.splice(0, 3);
    var p2handArr = this.p2.deck.splice(0, 3);
    this.p1.hand = p1handArr;
    this.p2.hand = p2handArr;

    // 回合數 +1
    this.gs.round++;

    // 回合開始
    while (
      this.p1.health > 0 &&
      this.p2.health > 0 &&
      this.p1.deck.length > 0 &&
      this.p2.deck.length > 0
    ) {
      this.onturnP1();

      while (!this.p1.endOfMyTurn) {
        yield "p1 is doing something...";
      }

      this.onturnP2();

      while (!this.p2.endOfMyTurn) {
        yield "p2 is doing something...";
      }

      // 回合數 +1
      this.gs.round++;

      // 魔力水晶數 +1 最大是 9
      if (this.gs.round >= 10) {
        this.p1.mana = 9;
        this.p2.mana = 9;
      } else {
        this.p1.mana = this.gs.round;
        this.p2.mana = this.gs.round;
      }
    }
    // 遊戲結束
    this.onGameEnd();
  }

  setdeck(player, deck) {
    this[player].deck = deck;
  }

  onturnP1() {
    this.gs.turn = this.p1.name;
    this.p1.endOfMyTurn = false;
    // 抽一張牌
    var card = this.p1.deck.shift();
    this.p1.hand.push(card);
  }

  onturnP2() {
    this.gs.turn = this.p2.name;
    this.p2.endOfMyTurn = false;
    // 抽一張牌
    var card = this.p2.deck.shift();
    this.p2.hand.push(card);
  }

  // ======================================================

  putHandToBoard(player, handCardIdx, boardCardIdx) {
    var m = this[player].mana;
    var c = this[player].hand[handCardIdx];

    // 確認有沒有足夠的魔力水晶
    if (m - c.mana >= 0) {
      // 扣除魔力水晶
      this[player].mana -= c.mana;
      // 默認放到桌上的最後一張
      boardCardIdx = boardCardIdx || this[player].board.length;
      // 移除該手牌
      var removedCardArr = this[player].hand.splice(handCardIdx, 1);
      // 放到遊戲桌面
      this[player].board.splice(boardCardIdx, 0, removedCardArr[0]);
    }
  }

  boardAttackBoard(player, selfCardIdx, enemyCardIdx) {
    var enemyPlayer = player === "p1" ? "p2" : "p1";
    var selfCard = this[player].board[selfCardIdx];
    var enemyCard = this[enemyPlayer].board[enemyCardIdx];

    if (selfCard && enemyCard) {
      // 兩方卡牌都要扣血
      selfCard.health -= enemyCard.attack;
      enemyCard.health -= selfCard.attack;
      // 死亡判斷
      if (selfCard.health <= 0) {
        this[player].board.splice(selfCardIdx, 1);
      }
      if (enemyCard.health <= 0) {
        this[enemyPlayer].board.splice(enemyCardIdx, 1);
      }
    }
  }

  boardAttackHero(player, selfCardIdx) {
    var enemyPlayer = player === "p1" ? "p2" : "p1";
    var selfCard = this[player].board[selfCardIdx];

    if (selfCard) {
      // 敵方英雄扣血
      this[enemyPlayer].health -= selfCard.attack;
    }
  }

  // ======================================================

  onGameEnd() {
    // 遊戲結束:依據英雄生命或排堆是否抽完來判斷輸贏
    this.gs.isGameOver = true;
    if (this.p1.health <= 0) {
      this.gs.winner = this.p2.name;
      this.gs.loser = this.p1.name;
    } else if (this.p2.health <= 0) {
      this.gs.winner = this.p1.name;
      this.gs.loser = this.p2.name;
    } else if (this.p1.deck.length <= 0) {
      this.gs.winner = this.p2.name;
      this.gs.loser = this.p1.name;
    } else if (this.p2.deck.length <= 0) {
      this.gs.winner = this.p1.name;
      this.gs.loser = this.p2.name;
    }
  }
}

var p = new Game("alice", "dana", [1, 2], [1, 2]);

console.log("-----======= start =======-----");

var r = p.onGameStart();
var msg;
msg = r.next();

p.setdeck("p1", [
  { mana: 1, health: 1, attack: 1, init_h: 1, init_a: 4 },
  { mana: 1, health: 2, attack: 2, init_h: 1, init_a: 4 },
  { mana: 1, health: 3, attack: 2, init_h: 1, init_a: 4 },
  { mana: 1, health: 2, attack: 4, init_h: 1, init_a: 4 },
  { mana: 1, health: 1, attack: 2, init_h: 1, init_a: 4 },
  { mana: 1, health: 2, attack: 1, init_h: 1, init_a: 4 },
  { mana: 1, health: 4, attack: 2, init_h: 1, init_a: 4 },
  { mana: 1, health: 2, attack: 3, init_h: 1, init_a: 4 }
]);
msg = r.next();

p.setdeck("p2", [
  { mana: 1, health: 1, attack: 1, init_h: 1, init_a: 4 },
  { mana: 1, health: 2, attack: 2, init_h: 1, init_a: 4 },
  { mana: 1, health: 3, attack: 2, init_h: 1, init_a: 4 },
  { mana: 1, health: 2, attack: 4, init_h: 1, init_a: 4 },
  { mana: 1, health: 1, attack: 2, init_h: 1, init_a: 4 },
  { mana: 1, health: 2, attack: 1, init_h: 1, init_a: 4 },
  { mana: 1, health: 4, attack: 2, init_h: 1, init_a: 4 },
  { mana: 1, health: 2, attack: 3, init_h: 1, init_a: 4 }
]);
msg = r.next();
console.log(p.p1);
console.log(p.p2);

console.log("----- round1 p1 -----");

// 將一張手排放到桌面
// console.log(p.p1);
p.putHandToBoard("p1", 1, 0);
// console.log(p.p1);
msg = r.next();

// 結束自己的回合
p.p1.endOfMyTurn = true;
msg = r.next();

console.log("----- round1 p2 -----");

console.log(p.p1);
console.log(p.p2);
// console.log(p.p2);
p.putHandToBoard("p2", 0);
// console.log(p.p2);
msg = r.next();

p.p2.endOfMyTurn = true;
msg = r.next();

console.log("----- round2 p1 -----");

// console.log(p.p1);
p.boardAttackBoard("p1", 0, 0);
msg = r.next();
console.log(msg);

p.p1.endOfMyTurn = true;
msg = r.next();

console.log("----- round2 p2 -----");

p.boardAttackHero("p2", 0);
msg = r.next();

// console.log(p.p1);
// console.log(p.p2);
console.log(p.gs);

p.p2.endOfMyTurn = true;
msg = r.next();

console.log("-----======= end =======-----");
console.log(p.gs);
