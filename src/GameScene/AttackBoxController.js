
//boss>箭头>炸弹>盾牌>红色>绿色>黄色

var AttackBoxController = cc.Node.extend({
    _gameSceneController: null,
    _target : null,
    _heroBoxes : [],
    _enemyBoxes : [],

    //英雄方块重生间隔
    _judgeTime: 0,
    _judgeTimePeriod: 0,
    _boxWeight : 0,

    _data: null,

    //普通方块权重
    _normalBoxWeight: 0,
    //暴击方块权重
    _criticalBoxWeight: 0,
    //初始方块权重
    _defWeight : 0,
    //默认最大权重值
    _defMaxWeight : 0,
    //每点击一次方块权重增加量
    _addWeight : 0,
    //当前最大权重值
    _maxBoxWeight : 0,

    //暴击方块出现几率
    _criticalBoxChance:0,

    //combo技能击退距离
    _repelDistance:0,
    //combo值大于5时，每点附加的击退距离
    _repelDistanceAdditional:0,
    //默认最大击退距离
    _defMaxRepelDistance:0,

    _judgeTimeMin : 0,
    _judgeTimeMax : 0,
    _sliderSpeed : 0,
    _sliderAcceleration : 0,

    //当前敌人产生的攻击盒子个数
    _enemyBoxCount: 0,
    _enemy: null,
    //敌人方块重生间隔
    _enemyJudgeTime: 0,
    _enemyJudgeTimePeriod: 0,
    //敌人技能释放间隔
    _enemySkillJudgeTime: 0,
    _enemySkillJudgeTimePeriod: 0,
    _enemyStage: 1,

    _hero: null,

    //记录还需生成的敌人特殊方块数
    _enemySpecialBoxLeft: 0,

    //
    _enemBoxBackTime: 0,
    _enemBoxBackTimeT1: 0,
    _enemBoxBackSpeed: 0,

    //_sliderAccelerationPerStage : 0,
    ctor: function (target) {

        this._target = target;
        this.loadConfig();
    },
    loadConfig : function(){
        this._data = DataHandler.getInstance().getConfigData();
        this._gameSceneController = GameSceneController.getInstance();

        this._defWeight = parseFloat(this._data["def_weight"]);
        this._addWeight = parseFloat(this._data["add_weight"]);
        this._defMaxWeight = parseFloat(this._data["max_weight"]);
        this._judgeTimeMin = parseFloat(this._data["judgetime_low"]);
        this._judgeTimeMax = parseFloat(this._data["judgetime_hight"]);

        this._normalBoxWeight = parseFloat(this._data["ysquare_weight"]);
        this._criticalBoxWeight = parseFloat(this._data["gsquare_weight"]);
        this._criticalBoxChance = parseFloat(this._data["gsquare_percent"]);

        this._sliderAcceleration = util.getValueByPercentage(this._data["blue_speedup1"]);

        this._repelDistance = util.getValueByPercentage(this._data["repel_range"]);
        this._repelDistanceAdditional = util.getValueByPercentage(this._data["combo_repel"]);
        this._defMaxRepelDistance = util.getValueByPercentage(this._data["max_repel"]);

        this._enemBoxBackTime = parseFloat(this._data["red_back"]);
        this._enemBoxBackTimeT1 = parseFloat(this._data["red_back1"]);
        this._enemBoxBackSpeed = parseFloat(this._data["red_back2"]);

        this._heroBoxes = [];
        for(var idx = 0; idx < util.getPropertyCount(HeroBoxType); idx++){
            this._heroBoxes.push([]);
        }
        this._boxWeight = 0;
        this._maxBoxWeight = this._defWeight;
        this._judgeTimePeriod = 0;
        this._judgeTime = this.getRandomJudgeTime();
        this._enemySpecialBoxLeft = 0;
    },
    onEnter:function () {
        this._super();
    },
    /**
     * @param {Hero} hero
     */
    setHero : function(hero){
        this._hero = hero;
    },
    /**
     * @param {Enemy} enemy
     */
    loadDataByEnemy : function(enemy){
        this._enemy = enemy;
        this._sliderSpeed = this._enemy._sliderSpeed;

        this._maxBoxWeight = this._defWeight;
        this._judgeTimePeriod = 0;
        this._judgeTime = this.getRandomJudgeTime();

        this._enemyBoxes = [];
        for(var idx = 0; idx < util.getPropertyCount(EmenyBoxType); idx++){
            this._enemyBoxes.push([]);
        }

        this._enemyJudgeTime = this.getEnemyRandomJudgeTime();
        this._enemyJudgeTimePeriod = 0;
        this._enemySkillJudgeTime = this._enemy._skillCd;
        this._enemySkillJudgeTimePeriod = 0;
        this._enemyStage = 1;
        this._enemyBoxCount = 0;
        this._enemySpecialBoxLeft = 0;
    },
    initBoxs : function(){

        //var acArray = [];
        //var count = 4;
        //for(var idx = 0; idx < count; idx++){
        //    var ac1 = cc.callFunc(this.addHeroBox, this, false);
        //    var ac2 = cc.delayTime(0.1);
        //
        //    if(idx< (count - 1)){
        //        acArray.push(ac1);
        //        acArray.push(ac2);
        //    }else{
        //        acArray.push(ac1);
        //    }
        //}
        //
        //var action = cc.sequence(acArray);
        //this.scheduleUpdate(action);
        //cc.scheduler.schedule(this.addHeroBox, this, 0.1, 4, 0, false, false);
        //this.schedule(this.addHeroBox, 0.1, 4, false, false);

        //this.scheduleOnce
        //todo scheduler不支持repeat和delay
        //cc.director.getScheduler().schedule(this.addHeroBox, this, 0.1, 4, 0, false, false);
    },
    getRandomJudgeTime : function(){
        return util.getRandomFloat(this._judgeTimeMin,this._judgeTimeMax);
    },
    getEnemyRandomJudgeTime : function(){
        if(this._enemyStage === 1){
            return this._enemy._stage1Cd;
        }else{
            return util.getRandomFloat(this._enemy._stage2CdMin,this._enemy._stage2CdMax);
        }

    },
    reset : function(){
        this._maxBoxWeight = this._defWeight;
    },
    update:function(dt){
        this.updateHeroBox(dt);
        this.updateEnemyBox(dt);
    },
    updateHeroBox:function(dt){
        this._judgeTimePeriod += dt;
        if(this._judgeTimePeriod >= this._judgeTime){
            this._judgeTimePeriod -= this._judgeTime;
            this._judgeTime = this.getRandomJudgeTime();
            var deltaWeight = this._maxBoxWeight - this._boxWeight;
            if(deltaWeight > 3){
                if(this._gameSceneController.getBattleType() === BattleType.Chest){
                    this.addHeroHealBox(true);
                    this.addHeroHealBox(true);
                }else{
                    this.addHeroBox(true);
                    this.addHeroBox(true);
                }

            }else if(deltaWeight > 0){
                if(this._gameSceneController.getBattleType() === BattleType.Chest){
                    this.addHeroHealBox(true);
                }else{
                    this.addHeroBox(true);
                }
            }
        }
    },
    updateEnemyBox:function(dt){
        //更新方块位置逻辑
        for(var idx = 0; idx < this._enemyBoxes.length; idx++){
            var boxes = this._enemyBoxes[idx];

            for(var subidx = 0; subidx < boxes.length; subidx++) {

                var box = boxes[subidx];
                box.update(dt);
                if (box.getPosition().x <= (ATTACK_HOLDER_MIN_X + box.getContentSize().width / 2)) {
                    box.removeFromParent();
                    boxes.splice(subidx, 1);
                    subidx--;

                    var attackType = AttackType.NormalAttack;
                    if(box._actionType === ActionType.EnemyCriticalAttack){
                        attackType = AttackType.CriticalAttack;
                    }
                    this._enemy.attack(attackType, this._hero);
                    this._target.updateUI();
                }
            }
        }

        //敌人释放技能逻辑
        if(this._enemyStage === 2){
            this._enemySkillJudgeTimePeriod += dt;
            if(this._enemySkillJudgeTimePeriod >= this._enemySkillJudgeTime){
                this._enemySkillJudgeTimePeriod -= this._enemySkillJudgeTime;
                if(util.getRandomProbability(this._enemy._skillChance)){
                    //var skillId = parseInt(util.getRandomElement(this._enemy._skillArray));
                    //this.enemyCastingSkill(skillId);

                }
            }
        }

        //添加方块逻辑
        this._enemyJudgeTimePeriod += dt;
        if(this._enemyJudgeTimePeriod >= this._enemyJudgeTime){
            this._enemyJudgeTimePeriod -= this._enemyJudgeTime;
            this._enemyJudgeTime = this.getEnemyRandomJudgeTime();

            if(this._enemyStage === 1){
                if(this._gameSceneController.getBattleType() === BattleType.Chest){
                    this.addChestBox();
                }else{
                    this.addEnemyBox();
                }

                this._enemyBoxCount++;
                if(this._enemyBoxCount >= this._enemy._stage1BoxNumber){
                    this._enemyStage = 2;
                }
            }else{
                if(this._gameSceneController.getBattleType() === BattleType.Chest){
                    this.addChestBox();
                }else{
                    this.addEnemyBox();
                }
            }
        }
    },
    /**
     * @param {Boolean} randomType   -true:产生黄色或绿色方块  false:只产生黄色方块
     */
    addHeroBox : function(randomType){
        var deltaWeight = this._maxBoxWeight - this._boxWeight;
        //控制当前权重不超过最大权重
        if(deltaWeight < this._criticalBoxWeight){
            randomType = false;
        }else if(deltaWeight < this._normalBoxWeight){
            return;
        }

        var boxType;
        var boxSize;

        if(randomType){

            var random = Math.random();
            if(random < this._criticalBoxChance){
                boxType = HeroBoxType.Critical;
            }else{
                boxType = HeroBoxType.Normal;
            }
        }else{
            boxType = HeroBoxType.Normal;
        }

        //boxSize = util.getRandomElement([BoxSize.Small, BoxSize.Middle, BoxSize.Large]);
        if(boxType === HeroBoxType.Normal){
            boxSize = util.getRandomElement([BoxSize.Small, BoxSize.Middle, BoxSize.Large]);
        }else{
            boxSize = util.getRandomElement([BoxSize.Middle, BoxSize.Large]);
        }

        this.addHeroBoxWithConfig(boxType, boxSize);
    },
    addHeroHealBox : function(randomType){

        var deltaWeight = this._maxBoxWeight - this._boxWeight;
        //控制当前权重不超过最大权重
        if(deltaWeight < this._criticalBoxWeight){
            randomType = false;
        }else if(deltaWeight < this._normalBoxWeight){
            return;
        }

        var boxType;
        var boxSize;

        if(randomType){

            var box1Change = this._enemy._goldBox1Change;
            var box2Change = this._enemy._goldBox2Change;
            //0~box1Change: 金币方块1几率
            //box1Change~box2Change: 金币方块2几率
            //box2Change~1: 金币方块3几率

            var random = Math.random();
            if(random < box1Change){
                boxType = HeroBoxType.Gold1;
            }else{
                boxType = HeroBoxType.Gold2;
            }
        }else{
            boxType = HeroBoxType.Gold1;
        }

        boxSize = BoxSize.Middle;
        if(boxType === HeroBoxType.Gold2){
            boxSize = BoxSize.Large;
        }
        this.addHeroBoxWithConfig(boxType, boxSize);
    },
    addHeroBoxWithConfig : function(boxType, boxSize){
        var box = new HeroBox(boxType, boxSize);

        if(boxType === HeroBoxType.Gold1){
            box._goldCount = util.getRandomNumber(this._enemy._goldBox1MinGold, this._enemy._goldBox1MinGold);
        }else if(boxType === HeroBoxType.Gold2){
            box._goldCount = util.getRandomNumber(this._enemy._goldBox2MinGold, this._enemy._goldBox2MinGold);
        }

        var minX = ATTACK_HOLDER_MIN_X + box.getContentSize().width/2;
        var manX = ATTACK_HOLDER_MAX_X - box.getContentSize().width/2;
        var x = Math.random()*(manX - minX) + minX;
        box.setPosition(x, 0.26786*ScreenSize.height);
        this._boxWeight += box.getWeight();

        var zOrder = boxType;
        this._target.addChild(box, zOrder);
        this._heroBoxes[box._type].push(box);
    },
    addChestBox : function(){

        var boxType;
        var boxSize = BoxSize.Middle;

        var box1Change = this._enemy._healBox1Change;
        var box2Change = this._enemy._healBox2Change;
        //0~box1Change: 金币方块1几率
        //box1Change~box2Change: 金币方块2几率
        //box2Change~1: 金币方块3几率

        var random = Math.random();
        if(random < box1Change){
            boxType = EmenyBoxType.Heal1;
        }else{
            boxType = EmenyBoxType.Heal2;
        }

        this.addChestBoxWithConfig(boxType, boxSize);
    },
    addChestBoxWithConfig : function(boxType, boxSize){
        var box = new ChestBox(boxType, boxSize, this._enemy);
        var x = ATTACK_HOLDER_MAX_X - box.getContentSize().width/2;
        box.setPosition(x, 0.26786*ScreenSize.height);

        var zOrder = 50 + box._type;
        this._target.addChild(box, zOrder);
        this._enemyBoxes[box._type].push(box);
    },
    addEnemyBox : function(){
        var generateSpecialBox = false;

        if(this._enemySpecialBoxLeft > 0){
            this._enemySpecialBoxLeft--;
            generateSpecialBox = true;
        }else if(this._enemyStage === 1){
            var random = Math.random();
            if(random < this._enemy._stage1SpecialChance){
                generateSpecialBox = true;
            }else{
                generateSpecialBox = false;
            }
        }else{
            var special1 = this._enemy._stage2SpecialChance;
            var special2 = special1 + this._enemy._stage2DoubleChance;
            var special3 = special2 + this._enemy._stage2TripleChance;
            //0~special1: 1块特殊方块几率
            //special1~special2: 2块特殊方块几率
            //special2~special3: 3块特殊方块几率
            //special3~1: 普通方块几率
            var random = Math.random();
            if(random < special1){
                generateSpecialBox = true;
            }else if(random < special2){
                generateSpecialBox = true;
                this._enemySpecialBoxLeft = 1;
            }else if(random < special3){
                generateSpecialBox = true;
                this._enemySpecialBoxLeft = 2;
            }else{
                generateSpecialBox = false;
            }
        }

        var boxType;
        var boxSize;

        if(generateSpecialBox){
            boxType = util.getRandomElement([EmenyBoxType.Shield, EmenyBoxType.Bomb,EmenyBoxType.Speed]);
            boxSize = BoxSize.Middle;
        }else{
            boxType = EmenyBoxType.Normal;
            boxSize = util.getRandomElement([BoxSize.Middle, BoxSize.Large]);
            //boxSize = util.getRandomElement([BoxSize.Small, BoxSize.Middle, BoxSize.Large]);
        }

        this.addEnemyBoxWithConfig(boxType, boxSize);
    },
    addEnemyBoxWithConfig : function(boxType, boxSize){
        var box = new EnemyBox(boxType, boxSize, this._enemy);
        var x = ATTACK_HOLDER_MAX_X - box.getContentSize().width/2;
        box.setPosition(x, 0.26786*ScreenSize.height);

        var zOrder = 50 + box._type;
        this._target.addChild(box, zOrder);
        this._enemyBoxes[box._type].push(box);
    },

    /**
     * 怪物释放技能
     * @param {Int} skillId   技能Id
     */
    enemyCastingSkill : function(skillId) {
        var convertId = skillId + 3101;
        switch(convertId){
            case ObjectId.Crital:
                this.addEnemyBoxWithConfig(EmenyBoxType.Crital, BoxSize.Middle);
                break;
            case ObjectId.Purple:
                this.addEnemyBoxWithConfig(EmenyBoxType.Purple, BoxSize.Middle);
                break;
            case ObjectId.PurpleSlow:
                this.addEnemyBoxWithConfig(EmenyBoxType.PurpleSlow, BoxSize.Middle);
                break;
            case ObjectId.Swap:
                break;
            case ObjectId.AttackCurse:
                break;
            case ObjectId.DefenseCurse:
                break;
            case ObjectId.Long:
                break;
            case ObjectId.Ice:
                break;
            case ObjectId.Stone:
                break;
            default:
                break;
        }
    },

    cleanEnemyBoxes : function() {
        for (var idx = 0; idx < this._enemyBoxes.length; idx++) {
            var boxes = this._enemyBoxes[idx];

            for (var subidx = 0; subidx < boxes.length; subidx++) {
                var emenyBox = boxes[subidx];
                emenyBox.removeFromParent();
                boxes.splice(subidx, 1);
                subidx--;
            }
        }
    },

    cleanHeroBoxes : function() {
        for (var idx = 0; idx < this._heroBoxes.length; idx++) {
            var boxes = this._heroBoxes[idx];

            for (var subidx = 0; subidx < boxes.length; subidx++) {
                var emenyBox = boxes[subidx];
                emenyBox.removeFromParent();
                boxes.splice(subidx, 1);
                subidx--;
            }
        }

        this._boxWeight = 0;
    },

    /**
     * 判定谁攻击谁
     * @param {Float} location   -点击的位置x坐标
     * *@return {Array} 0:ActionType  1:data
     */
    clickAt : function(location) {
        if(this._maxBoxWeight < this._defMaxWeight){
            this._maxBoxWeight += this._addWeight;

            if(this._maxBoxWeight > this._defMaxWeight){
                this._maxBoxWeight = this._defMaxWeight;
            }
        }

        var result = this.collisionWithBoxes(location, this._enemyBoxes);

        if(result[0] === ActionType.NullAction){
            result = this.collisionWithBoxes(location, this._heroBoxes);
        }

        if(result[0] === ActionType.NullAction){
            result = [ActionType.EnemyAttack, null];
        }

        return result;
    },
    /**
     * 判定蓝光标和盒子的碰撞
     * @param {Float} location   -点击位置x坐标
     * @param {Array} boxes   -待检测的盒子
     * @param {Boolean} isHeroBoxes   -区分英雄和敌人的方块
     * @return {Array} 0:ActionType  1:data
     */
    collisionWithBoxes :function(location, boxes){
        var actionType = ActionType.NullAction;
        var data = null;
        var len = boxes.length;
        var clickedBox = false;
        for(var idx = len - 1; idx >= 0; idx--) {
            var subboxes = boxes[idx];
            var sublen = subboxes.length;
            for (var subidx = sublen - 1; subidx >= 0; subidx--) {
                var box = subboxes[subidx];
                var min = box.getPosition().x - box.getContentSize().width / 2;
                var max = box.getPosition().x + box.getContentSize().width / 2;
                if (location >= min && location <= max) {

                    if (box._objectId === ObjectId.HeroBox) {
                        this._boxWeight -= box.getWeight();
                        box.removeFromParent();
                        subboxes.splice(subidx, 1);
                        actionType = box._actionType;

                        data = box._goldCount;

                    }else if(box._objectId === ObjectId.EnemyBox){
                        var shouldRemove = box.onClick();

                        if(shouldRemove){
                            box.removeFromParent();
                            subboxes.splice(subidx, 1);
                        }

                        if(box._type === EmenyBoxType.Bomb){
                            var boundingBox = box.getBoundingBox();

                            var rect = cc.rect(boundingBox.x - boundingBox.width/2, boundingBox.y, boundingBox.width*2, boundingBox.height);
                            this.removeBoxesByRect(rect);
                        }

                        actionType = ActionType.HeroDefence;
                    }else if(box._objectId === ObjectId.ChestBox){
                        var shouldRemove = box.onClick();

                        if(shouldRemove){
                            box.removeFromParent();
                            subboxes.splice(subidx, 1);
                        }

                        if(box._type === EmenyBoxType.Heal1 ||
                            box._type === EmenyBoxType.Heal2){
                            data = box._recoverHp;
                        }

                        actionType = ActionType.AddHP;
                    }

                    clickedBox = true;
                    break;
                }
            }

            if(clickedBox){
                break;
            }
        }

        return [actionType, data];
    },
    removeBoxesByRect:function(rect){
        for (var idx = 0; idx < this._enemyBoxes.length; idx++) {
            var boxes = this._enemyBoxes[idx];

            for (var subidx = 0; subidx < boxes.length; subidx++) {
                var emenyBox = boxes[subidx];

                if(cc.rectOverlapsRect(emenyBox.getBoundingBox(), rect)){
                    emenyBox.removeFromParent();
                    boxes.splice(subidx, 1);
                    subidx--;
                }

            }
        }

        for (var idx = 0; idx < this._heroBoxes.length; idx++) {
            var boxes = this._heroBoxes[idx];

            for (var subidx = 0; subidx < boxes.length; subidx++) {
                var heroBox = boxes[subidx];

                if(cc.rectIntersectsRect(heroBox.getBoundingBox(), rect)){
                    heroBox.removeFromParent();
                    boxes.splice(subidx, 1);
                    this._boxWeight -= heroBox.getWeight();
                    subidx--;
                }

            }
        }
    },
    comboAction:function(){
        for (var idx = 0; idx < this._enemyBoxes.length; idx++) {
            var boxes = this._enemyBoxes[idx];

            for (var subidx = 0; subidx < boxes.length; subidx++) {
                var emenyBox = boxes[subidx];

                var shouldRemove = this.repelEnemyBox(emenyBox);
                if(shouldRemove){
                    boxes.splice(subidx, 1);
                }
            }
        }
    },
    /*
     *
     *combo击退动画, 匀加速＋匀减速 后退
     */
    repelEnemyBox:function(box){

        //总时间
        var T = this._enemBoxBackTime;
        //到达中间最高速度的时间
        var T1 = this._enemBoxBackTimeT1;
        //初始速度和最大速度的比率
        var r = this._enemBoxBackSpeed;

        var shouldRemove = false;
        var comboNum = this._hero._comboNumber;
        var repelDistance = this._repelDistance + (comboNum - MAX_BOX_COUNT)*this._repelDistanceAdditional;

        if(repelDistance > this._defMaxRepelDistance){
            repelDistance = this._defMaxRepelDistance;
        }

        //位移
        var S = repelDistance;

        var x = box.getPosition().x;
        var maxDeltaX = (ATTACK_HOLDER_MAX_X - box.getContentSize().width/2 - x);
        var deltaX = repelDistance;

        if(deltaX >= maxDeltaX){
            S = maxDeltaX;
            T = T * (maxDeltaX/deltaX);
            T1 = T1 * (maxDeltaX/deltaX);
            shouldRemove = true;
        }

//(1+r)/2*V*T * (1/2)*V*(T-T1) = S
//V=S/(((1+r)/2)*T1 +(1/2)*(T-T1))

        //最大速度
        var V = S/(((1+r)/2)*T1 +(1/2)*(T-T1));
        //初始速度
        var V0 = V * r;

        var S1 = ((V + V0)*T1)/2;
        var S2 = S - S1;
        var T2 = T - T1;

        var action;
        if(shouldRemove){
            var move1 = cc.moveBy(T1, S1, 0);
            move1.easing(cc.easeAcceleration(V0, V));
            var move2 = cc.moveBy(T2, S2, 0);
            move2.easing(cc.easeAcceleration(V, 0));
            var callBack = cc.callFunc(this.removeActor, this);
            action = cc.sequence(move1, move2, callBack);
        }else{
            var move1 = cc.moveBy(T1, S1, 0);
            move1.easing(cc.easeAcceleration(V0, V));
            var move2 = cc.moveBy(T2, S2, 0);
            move2.easing(cc.easeAcceleration(V, 0));
            action = cc.sequence(move1, move2);
        }

        box.runAction(action);
        return shouldRemove;
    },
    /*
     *匀速的combo击退动画
     *
     repelEnemyBox:function(box){

     this._enemBoxBackTime;
     this._enemBoxBackTimeT1;
     this._enemBoxBackSpeed;

     var shouldRemove = false;
     var comboNum = this._hero._comboNumber;
     var repelDistance = this._repelDistance + (comboNum - MAX_BOX_COUNT)*this._repelDistanceAdditional;

     if(repelDistance > this._defMaxRepelDistance){
     repelDistance = this._defMaxRepelDistance;
     }

     var action;
     var duration = PLAY_COMBO_TIME;
     var x = box.getPosition().x;
     var maxDeltaX = (ATTACK_HOLDER_MAX_X - box.getContentSize().width/2 - x);
     var deltaX = repelDistance;
     if(deltaX >= maxDeltaX){
     duration = PLAY_COMBO_TIME * (maxDeltaX/deltaX);
     var move = cc.moveBy(duration, maxDeltaX, 0);
     move.easing(cc.easeInOut(1.0));
     var callBack = cc.callFunc(this.removeActor, this);
     action = cc.sequence(move, callBack);
     shouldRemove = true;
     }else{
     action = cc.moveBy(duration, deltaX, 0);
     action.easing(cc.easeInOut(1.0));
     shouldRemove = false;
     }

     box.runAction(action);
     return shouldRemove;
     },
     */
    removeActor:function(sender){
        sender.removeFromParent();
    },
    callBackAction:function(sender){

    }
});

