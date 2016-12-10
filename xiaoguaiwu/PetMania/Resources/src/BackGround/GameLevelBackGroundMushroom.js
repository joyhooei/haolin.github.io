cc.GameLevelBackGroundMushroom = cc.IBackGround.extend({

    //------------------------------------------------------------------------------------------------------------------
    ctor: function()
    {
        this._super();
    },

    //------------------------------------------------------------------------------------------------------------------
    release: function()
    {
        this._super();

        //
        cc.ResourceMng.getInstance().removeTextureCache(this.parseBackGroundImageRes());

        if (this._displayIOSFlag)
        {
            //
            cc.ResourceMng.getInstance().removeFromCache(
                _ImagesPath + "background_1.plist",
                _ImagesPath + "background_1.pvr.ccz"
            );
        }

        return this;
    },

    //------------------------------------------------------------------------------------------------------------------
    parseBackGroundImageRes: function()
    {
        return _ImagesPath + "background_1.jpg";
    },

    //------------------------------------------------------------------------------------------------------------------
    display: function(_backGroundLayer)
    {
        this._super(_backGroundLayer);

        //
        var mainBack = cc.Sprite.create(this.parseBackGroundImageRes());
        _backGroundLayer.addChild(mainBack);
        mainBack.setAnchorPoint(cc.p(0, 0));

        //
        GUI.backGroundScaleToScreen(mainBack);
        cc.ResourceMng.getInstance().removeTextureCache(this.parseBackGroundImageRes());

        //
        /*var firefly = cc.ArmatureDataMng.getInstance().createFireFly();
        if (firefly)
        {
            firefly.setPosition(cc.p(_ScreenCenter().x+50,_ScreenCenter().y+20));
            _backGroundLayer.addChild(firefly);
        }*/

        return this;
    },

    //------------------------------------------------------------------------------------------------------------------
    displayIOS: function(_backGroundLayer)
    {
        this._super(_backGroundLayer);

        cc.log("GameLevelBackGroundGold displayIOS");

        //加载资源
        cc.ResourceMng.getInstance().addToCache(
            _ImagesPath + "background_1.plist",
            _ImagesPath + "background_1.pvr.ccz");

        //创建
        var mainBack = cc.Sprite.createWithSpriteFrameName("background_1.png");
        _backGroundLayer.addChild(mainBack);
        GUI.backGroundScaleToScreen(mainBack);
        mainBack.setAnchorPoint(cc.p(0, 0));

        //Cache不要了
        cc.ResourceMng.getInstance().removeTextureCache(_ImagesPath + "background_1.pvr.ccz");

        //
        /*var firefly = cc.ArmatureDataMng.getInstance().createFireFly();
        if (firefly)
        {
            firefly.setPosition(cc.p(_ScreenCenter().x+50,_ScreenCenter().y+20));
            _backGroundLayer.addChild(firefly);
        }*/

        //
        return this;
    }
});

cc.GameLevelBackGroundMushroom.create = function()
{
    return new cc.GameLevelBackGroundMushroom();
};
