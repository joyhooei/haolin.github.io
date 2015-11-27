/**
 * Created by linhao on 15/4/2.
 */


var HeroBox = BaseBox.extend({
    //方块权重
    _weight : 0,
    _data : null,
        ctor : function(type, size){
        this._type = type;
        this._size = size;
        this._objectId = ObjectId.HeroBox;

        var color = null;
        var size = null;
        if(this._type === HeroBoxType.Critical){
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

        var frameName = "#" + color + size + ".png";
        this._super(frameName);
        return true;
    },
    loadConfig : function(){
        this._data = DataHandler.getInstance().getConfigData();
        if(this._type === HeroBoxType.Critical){
            this._weight = parseFloat(this._data["gsquare_weight"]);
            this._actionType = ActionType.HeroCriticalAttack;
        }else{
            this._weight = parseFloat(this._data["ysquare_weight"]);
            this._actionType = ActionType.HeroNormalAttack;
        }
    },
    getWeight : function(){
        return this._weight;
    }
});