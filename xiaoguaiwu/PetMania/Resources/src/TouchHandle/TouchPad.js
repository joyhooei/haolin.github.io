﻿//

//======================================================================================================================
var TouchPad = cc.Layer.extend({

    //------------------------------------------------------------------------------------------------------------------
    ctor: function()
    {
        this._super();
        cc.associateWithNative(this, cc.Layer);
    },

    //------------------------------------------------------------------------------------------------------------------
    init: function()
    {
        this._super();
        return this;
    },

    //------------------------------------------------------------------------------------------------------------------
    onTouchesBegan:function (touches, event)
    {

    },

    //------------------------------------------------------------------------------------------------------------------
    onTouchesMoved:function (touches, event)
    {

    },

    //------------------------------------------------------------------------------------------------------------------
    onTouchesEnded:function (touches, event)
    {

    }

    //------------------------------------------------------------------------------------------------------------------
  /*  onTouchesCancelled:function (touches, event)
    {

    }*/
});

