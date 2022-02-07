<template>
  <div>
    <el-button
      type="primary"
      icon="el-icon-plus"
      style="margin: 10px 0"
      @click="dialogTableVisible"
      >添加</el-button
    >
    <!-- 
        el-table:
            data:数组展示的数据
            el-table-column ：列
            width: 宽
            border:边框

     -->
    <el-table style="width: 100%" border :data="list">
      <el-table-column type="index" label="序号" width="80px" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width">
      </el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO" width="width">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt="" style="width: 100px; height: 100px" />
        </template>
      </el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template slot-scope="{ row, $index }">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="updateTradeMark(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeTradeMark(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器
   total 总共多少数据 
   current-page当前第几页 
   page-size 每页几条数据
   pager-count 页码按钮的数量，当总页数超过该值时会折叠 大于等于 5 且小于等于 21 的奇数
 -->
    <el-pagination
      style="text-align: center; margin-top: 20px"
      @size-change="handleSizeChange"
      @current-change="getTradeList"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      :current-page="page"
      :pager-count="7"
      layout="prev, pager, next, jumper, ->,sizes, total"
      :total="total"
      >>
    </el-pagination>
    <!--对话框 -->
    <!-- 
           Form 组件提供了表单验证的功能，只需要通过 rules 属性传入约定的验证规则，并将 Form-Item 的 prop 属性设置为需校验的字段名即可。
            action: 图片上传的地址
            :model="form"   表单特有的属性 将其📱添加到哪个对象身上
            :on-success：检验图片上传成功会执行的一次
            :before-upload  图片上传之前
           -->
    <el-dialog
      :title="tmForm.id ? '修改品牌' : '添加品牌'"
      :visible.sync="dialogFormVisible"
    >
      <el-form :rules="rules" style="width: 80%" :model="tmForm" ref="ruleForm">
        <el-form-item label="品牌名称" prop="tmName">
          <el-input v-model="tmForm.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "TradeMark",
  data() {
    // 自定义较验规则 tmName
    var validatetTmName = (rule, value, callback) => {
      if (value.length < 2 || value.length > 10) {
        callback(new Error("品牌名称在 2 - 10 个字之间 "));
      } else {
        callback();
      }
    };

    return {
      page: 1,
      limit: 3,
      total: 0,
      list: [],
      // 控制对话框的显示隐藏
      dialogFormVisible: false,
      // 表格收集数据的属性
      tmForm: {
        tmName: "",
        logoUrl: "",
      },
      // element ui form表单验证
      rules: {
        tmName: [
          { required: true, message: "请输入品牌名称", trigger: "blur" },
          // 自定义校验规则
          { validator: validatetTmName, trigger: "change" },
        ],
        logoUrl: [
          { required: true, message: "请选择品牌图片", trigger: "change" },
        ],
      },
    };
  },
  mounted() {
    this.getTradeList();
  },
  methods: {
    // 获取品牌列表数据
    async getTradeList(pager = 1) {
      this.page = pager;
      const { page, limit } = this;
      let result = await this.$API.tradeMark.reqGetTradeMarkList(page, limit);
      if (result.code == 200) {
        this.total = result.data.total;
        this.list = result.data.records;
      }
    },
    handleSizeChange(val) {
      this.limit = val;
      this.getTradeList();
      // console.log(`每页 ${val} 条`);
    },
    // 修改 添加 品牌谈话框
    dialogTableVisible() {
      //显示对话框
      this.dialogFormVisible = true;
      // 清除数据
      this.tmForm = { tmName: "", logoUrl: "" };
    },
    //修改品牌
    updateTradeMark(row) {
      // row 选中的品牌的信息
      this.dialogFormVisible = true;
      // 此处的row 是服务器返回的数据 不可以直接复制给tmFrom 否则当其修改后即便是点击取消 页面也会显示修改后的 此处需要浅拷贝
      this.tmForm = { ...row };
    },
    // 上传图片相关的回调
    // 图片上传成功
    handleAvatarSuccess(res, file) {
      this.tmForm.logoUrl = URL.createObjectURL(file.raw);
    },
    // 图片上传之前
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    // 点击谈话框 完成发送请求
    addOrUpdate() {
      this.$refs.ruleForm.validate(async (success) => {
        if (success) {
          this.dialogFormVisible = false;
          let result = await this.$API.tradeMark.reqAddOrUpdateTradeMark(
            this.tmForm
          );
          if (result.code == 200) {
            this.$message.success(
              this.tmForm.id ? "修改品牌成功" : "添加品牌成功"
            );
            // 添加品牌：留在第一页  修改品牌：留在当前页
            this.getTradeList(this.tmForm.id ? this.page : 1);
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // 删除品牌 根据 id
    removeTradeMark(row) {
      this.$confirm(`此操作将永久删除  ${row.tmName} , 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
          let result = await this.$API.tradeMark.reqRemoveTradeMark(row.id);
          if (result.code == 200) {
            this.$message.success("删除品牌成功");
            this.getTradeList(this.list.length > 1 ? this.page : this.page - 1);
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>>