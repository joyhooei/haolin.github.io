/**
 * Created by linhao on 15/4/2.
 */


var HeroBox = BaseBox.extend({
    //方块权重
    _weight : 0,
    _data : null,


    //消除增加的金币数量
    _goldCount : 0,
        ctor : function(type, size){
        this._type = type;
        this._size = size;
        this._objectId = ObjectId.HeroBox;

        var color = null;
        var size = null;
        if(this._type === HeroBoxType.Critical || this._type === HeroBoxType.Gold2){
            color = "green";
        }else{
            color = "yellow";
        }



        if(this._size === BoxSize.Small){
            size = "S";
        }else if(this._size === BoxSize.Middle){
            size = "M";
        }else{
            size = "L";
        }

        if(this._type === HeroBoxType.Gold1 ||
            this._type === HeroBoxType.Gold2){
            size = size + "Q";
        }

        var frameName = "#" + color + size + ".png";
        this._super(frameName);
        return true;
    },
    onEnter:function () {
        this._super();

        this.scaleY = 0.6;
        var ac1 = cc.scaleTo(0.2, 1.0, 1.12);
        var ac2 = cc.scaleTo(0.2, 1.0, 1.0);
        var ac = cc.sequence(ac1, ac2);
        this.runAction(ac);
    },
    onExit:function () {
        this._super();
    },
    loadConfig : function(){
        this._data = DataHandler.getInstance().getConfigData();
        if(this._type === HeroBoxType.Critical){
            this._weight = parseFloat(this._data["gsquare_weight"]);
            this._actionType = ActionType.HeroCriticalAttack;
        }else if(this._type === HeroBoxType.Gold1){
            this._weight = parseFloat(this._data["ysquare_weight"]);
            this._actionType = ActionType.AddCoins;
        }else if(this._type === HeroBoxType.Gold2){
            this._weight = parseFloat(this._data["gsquare_weight"]);
            this._actionType = ActionType.AddCoins;
        }else{
            this._weight = parseFloat(this._data["ysquare_weight"]);
            this._actionType = ActionType.HeroNormalAttack;
        }
    },
    getWeight : function(){
        return this._weight;
    }
});