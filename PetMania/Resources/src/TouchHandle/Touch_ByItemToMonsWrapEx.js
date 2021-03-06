﻿
//根据bubblesCount变成爆炸糖
cc.Touch_ByItemToMonsWrapEx = cc.Touch_ByItem.extend({
    bubblesCount:2,  //随机抓去的个数
    //------------------------------------------------------------------------------------------------------------------
    ctor: function (srcPos)
    {
        this.m_StartPos = srcPos;
    },

    //------------------------------------------------------------------------------------------------------------------
    description: function ()
    {
        return "Touch_ByItemToMonsWrapEx";
    },

    //------------------------------------------------------------------------------------------------------------------
    handle: function (gameLevel)
    {
        var self = this;
        var monsters = [];
        var table = gameLevel.getTable();
        var itr = table.createIterForMiddleObjects();
        for (itr.first(); !itr.isDone(); itr.next())
        {
            var middleObj = itr.getCurrent();
            if (!middleObj)
            {
                continue;
            }

            if (_CanUseItemToMonster(middleObj))
            {
                monsters.push(middleObj);
            }
        }

        if(monsters.length)
        {
            //道具使用成功
            Tools.shuffle(monsters);
            monsters = monsters.slice(0, this.bubblesCount);

            //var startPoint = cc.p(90,80);

            var ObjAnimNum = 0;

            for(var num=0; num<monsters.length; num++)
            {
                var tmpTapObj = monsters[num];

                var endPoint = tmpTapObj.getSprite().getPosition();
                //cc.EffectMng.getInstance().displayTailerBezierPath(startPoint, endPoint, function(tapObj)
                cc.EffectMng.getInstance().displayTailerBezierPath(this.m_StartPos, endPoint, function(tapObj)
                {
                    var gridParent = tapObj.getParentNode();
                    var createSuper = tapObj.createMonsterWrap();
                    gameLevel.disposal(tapObj);

                    if (gridParent)
                    {
                        gridParent.addNode(createSuper);
                        createSuper.updateNodePosition();
                        createSuper.renderNode();
                    }

                    ObjAnimNum++;
                    if(ObjAnimNum >= monsters.length)
                    {
                        self.endTransposition(gameLevel);
                    }
                }, tmpTapObj);
            }

        }else
        {
            //全屏无普通怪道具无法使用
            self.endTransposition(gameLevel);
        }

        return this;
    },
    //------------------------------------------------------------------------------------------------------------------
    swallowMoveTouch: function ()
    {
        return true;
    },

    endTransposition: function(gameLevel)
    {
        this.m_IsFinish = true;
        this.forcedInterrupt();
    }

    //------------------------------------------------------------------------------------------------------------------
});

//工厂方法
cc.Touch_ByItemToMonsWrapEx.create = function(srcPos)
{
    return new cc.Touch_ByItemToMonsWrapEx(srcPos);
};
