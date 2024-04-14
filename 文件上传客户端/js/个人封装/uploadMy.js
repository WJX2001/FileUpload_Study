
/* 
    通过请求主体 传递给服务器的数据格式：
      1、FormData (一般应用于文件上传)
      2、x-www-form-urlencoded （一般应用于非文件上传）
      3、json字符串  （非文件上传形式）
      4、普通文本字符串
      5、Buffer  
  */

// 发起请求
// (function () {
//   let fm = new FormData
//   fm.append('file', '')
//   fm.append('filename', '')
//   axios.post('/upload_single', fm).then(data => {

//   }).catch(reason => {

//   })

//   // 类型为www的情况  xxx=xxx&xxx=xxx
//   axios.post('/upload_single_base64', {
//     file: '',
//     filename: ''
//   },{
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded'
//     }
//   })
// })


// TODO: 单一文件上传
(function () {
  let upload = document.querySelector('#upload1'),
    upload_inp = upload.querySelector('.upload_inp'),
    upload_button_select = upload.querySelector('.upload_button.select'),
    upload_button_upload = upload.querySelector('.upload_button.upload'),
    upload_tip = upload.querySelector('.upload_tip'),
    upload_list = upload.querySelector('.upload_list')

  // 创建一个form变量
  let _file = null

  // 上传文件到服务器
  upload_button_upload.addEventListener('click', function () {
    // 非空校验
    if (!_file) {
      alert('请您先选择要上传的文件')
      return
    }
    // 把文件传递给服务器 FormData / BASE64
    let formData = new FormData()
    formData.append('file', _file)
    formData.append('filename', _file.name)
    instance.post('/upload_single', formData).then(data => {
      // + 号可以进行转换为数字
      if (+data.code === 0) {
        alert(`文件已经上传成功,您可以基于${data.servicePath} 访问这个资源`)
        return
      }
      return Promise.reject(data.codeText)
    }).catch(reason => {
      alert('文件上传失败，请您稍后再试')
    })


  })

  // 移除按钮的点击处理
  upload_list.addEventListener('click', function (ev) {
    let target = ev.target
    // 通过事件委托机制 判断事件源是不是em，如果是的话就进行移除
    if (target.tagName === 'EM') {
      // 移除文件
      _file = null

      // 点击的是移除按钮
      upload_tip.style.display = 'block'
      upload_list.style.display = 'none'
      upload_list.innerHTML = ``
    }
  })


  // 监听用户选择文件的操作
  upload_inp.addEventListener('change', function () {
    // 获取用户选中的文件
    //  + name: 文件名
    //  + size: 文件大小
    //  + type: 文件MIME类型
    let file = upload_inp.files[0]
    if (!file) return

    // 限制文件上传的格式 [方案一]
    if (!/(PNG|JPG|JPEG)/i.test(file.type)) {
      alert('上传的文件只能是 PNG|JPG|JPEG 格式的')
      return
    }
    // 方案二：直接在input框内使用 accept属性



    // 限制文件上传的大小 1MB = 1024KB 1Kb = 1024B
    if (file.size > 2 * 1024 * 1024) {
      alert('上传的文件不超过2MB')
      return
    }
    console.log(file)

    // 显示上传的文件
    _file = file
    upload_tip.style.display = 'none'
    upload_list.style.display = 'block'
    upload_list.innerHTML = `<li>
        <span>文件：${file.name}</span>
        <span><em>移除</em></span>
    </li>`


  })


  // 通过点击按钮 触发上传文件input框选择文件的行为
  upload_button_select.addEventListener('click', function () {
    upload_inp.click()
  })
})()
