// 品牌管理

import request from '@/utils/request';

// 获取品牌管理的 分页列表
// /admin/product/baseTrademark/{page}/{limit}
export  const reqGetTradeMarkList = (page, limit) => request.get(`/admin/product/baseTrademark/${page}/${limit}`)


// 修改 添加品牌管理 
//    1） 添加 POST /admin/product/baseTrademark/save     
    // 2） 修改  PUT /admin/product/baseTrademark/update

/*    添加不要id 
    参数： {
        "id": 0,
        "logoUrl": "string",
        "tmName": "string"
        }
*/
export const reqAddOrUpdateTradeMark = (tradeMark) => {
    // 若有id 则为修改品牌
    if (tradeMark.id) {
        return request({url:"/admin/product/baseTrademark/update",method:'put',data:tradeMark});
    }else{
        return request({url:"/admin/product/baseTrademark/save",method:'post',data:tradeMark});
    }
}



// 删除品牌  DELETE /admin/product/baseTrademark/remove/{id} 

export const reqRemoveTradeMark = (id) => request({url:`/admin/product/baseTrademark/remove/${id}`,method:'delete'})