
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


// TODO: 延迟函数
const delay = (interval) => {
  typeof interval !== 'number' ? interval = 1000 : null
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, interval)
  })
}


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


  // 将移除操作封装为抽象为一个函数
  const clearHandle = () => {
    // 移除文件
    _file = null

    // 移除提示
    upload_tip.style.display = 'block'
    upload_list.style.display = 'none'
    upload_list.innerHTML = ``
  }


  // 上传文件到服务器

  // 禁用/loading 按钮
  const changeDisable = (flag) => {
    if (flag) {
      upload_button_select.classList.add('disable')
      upload_button_upload.classList.add('loading')
      return
    }
    upload_button_select.classList.remove('disable')
    upload_button_upload.classList.remove('loading')
  }
  // 对上传到服务器进行监听
  upload_button_upload.addEventListener('click', function () {
    if (upload_button_upload.classList.contains('disable') || upload_button_upload.classList.contains('loading')) {
      return
    }
    // 非空校验
    if (!_file) {
      alert('请您先选择要上传的文件')
      return
    }
    changeDisable(true) // 变成不可使用状态
    // 把文件传递给服务器 FormData / BASE64
    let formData = new FormData()
    formData.append('file', _file)
    formData.append('filename', _file.name)
    instance.post('/upload_single', formData).then(data => {
      // + 号可以进行转换为数字
      if (+data.code === 0) {
        alert(`文件已经上传成功,您可以基于${data.servicePath} 访问这个资源`)
        clearHandle()
        changeDisable(false) // 变成可使用状态
        return
      }
      return Promise.reject(data.codeText)
    }).catch(reason => {
      alert('文件上传失败，请您稍后再试')
      clearHandle()
    }).finally(() => {
      // 不管成不成功 都会执行
      clearHandle()
      changeDisable(false)
    })

  })

  // 移除按钮的点击处理
  upload_list.addEventListener('click', function (ev) {
    let target = ev.target
    // 通过事件委托机制 判断事件源是不是em，如果是的话就进行移除
    if (target.tagName === 'EM') {
      clearHandle()
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
    if (upload_button_select.classList.contains('disable') || upload_button_select.classList.contains('loading')) {
      return
    }
    upload_inp.click()
  })
})();


/* 基于BASE64实现文件上传 */
(function () {
  let upload = document.querySelector('#upload2'),
    upload_inp = upload.querySelector('.upload_inp'),
    upload_button_select = upload.querySelector('.upload_button.select')

  // 验证是否处于可操作性状态
  const checkIsDisable = element => {
    let classList = element.classList
    return classList.contains('disable') || classList.contains('loading')
  }

  // 把选择的文件读取为BASE64 通过返回一个promise的形式处理异步结果 这样后续可以使用await拿到结果
  const changeBASE64 = file => {
    return new Promise(resolve => {
      let fileReader = new FileReader()
      fileReader.readAsDataURL(file)
      // 异步操作
      fileReader.onload = ev => {
        resolve(ev.target.result)
      }
    })
  }


  upload_inp.addEventListener('change', async function () {
    let file = upload_inp.files[0]

    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('上传的文件不能超过2MB~~')
      return
    }
    upload_button_select.classList.add('loading')
    const BASE64 = await changeBASE64(file)
    // 发起请求
    try {
      const data = await instance.post('/upload_single_base64', {
        // 防止长的BASE64码在传输过程中乱掉 使用encodeURIComponent
        file: encodeURIComponent(BASE64),
        filename: file.name

      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      if (+data.code === 0) {
        alert(`恭喜您，文件上传成功，您可基于${data.servicePath} 访问这个资源`)
        return
      }
      throw data.codeText
    } catch (err) {
      alert('很遗憾，文件上传失败，请您稍后再试')
    } finally {
      upload_button_select.classList.remove('loading')
    }
  })
  upload_button_select.addEventListener('click', function () {
    if (checkIsDisable(this)) return
    upload_inp.click()
  })
})();



/* 文件缩略图 & 自动生成名字 */
(function () {
  let upload = document.querySelector('#upload3'),
    upload_inp = upload.querySelector('.upload_inp'),
    upload_button_select = upload.querySelector('.upload_button.select'),
    upload_button_upload = upload.querySelector('.upload_button.upload'),
    upload_abbre = upload.querySelector('.upload_abbre'),
    upload_abbre_img = upload_abbre.querySelector('img')
  let _file = null

  // 验证是否处于可操作性状态
  const checkIsDisable = element => {
    let classList = element.classList
    return classList.contains('disable') || classList.contains('loading')
  }

  // 把选择的文件读取成为BASE64
  const changeBASE64 = file => {
    return new Promise(resolve => {
      let fileReader = new FileReader()
      fileReader.readAsDataURL(file)
      fileReader.onload = ev => {
        resolve(ev.target.result)
      }
    })
  }

  // 把文件转buffer,并且前端根据文件内容生成文件名
  const changeBuffer = file => {
    return new Promise(resolve => {
      let fileReader = new FileReader()
      fileReader.readAsArrayBuffer(file)
      fileReader.onload = ev => {
        let buffer = ev.target.result,
          spark = new SparkMD5.ArrayBuffer(),
          HASH,
          suffix
        spark.append(buffer)
        HASH = spark.end()
        // 拿到后缀
        suffix = /\.([a-zA-Z0-9]+)$/.exec(file.name)[1]
        resolve({
          buffer,
          HASH,
          suffix,
          filename: `${HASH}.${suffix}`
        })
      }
    })
  }

  // 把文件上传到服务器

  // 增加文件操作的样式
  const changeDisable = flag => {
    if (flag) {
      upload_button_select.classList.add('disable')
      upload_button_upload.classList.add('loading')
      return
    }
    upload_button_select.classList.remove('disable')
    upload_button_upload.classList.remove('loading')
  }
  // 点击上传服务器
  upload_button_upload.addEventListener('click', async function () {
    if (checkIsDisable(this)) return
    if (!_file) {
      alert('请您先选择要上传的文件')
      return
    }
    changeDisable(true)
    // 生成文件的HASH名字
    let { filename } = await changeBuffer(_file)
    let formData = new FormData()
    formData.append('file', _file)
    formData.append('filename', filename)
    instance.post('/upload_single_name', formData).then(data => {
      if (+data.code === 0) {
        alert(`文件已经上传成功~~,您可以基于 ${data.servicePath} 访问这个资源~~`)
        return
      }
      return Promise.reject(data.codeText)
    }).catch(reason => {
      alert('文件上传失败，请您稍后再试~~')
    }).finally(() => {
      changeDisable(false)
      upload_abbre.style.display = 'none'
      upload_abbre_img.src = ''
      _file = null
    })
  })

  // 文件预览，就是把文件对象转换为BASE64，赋值给图片的SRC属性即可
  upload_inp.addEventListener('change', async function () {
    const file = upload_inp.files[0]
    if (!file) return
    _file = file
    // 置灰
    upload_button_select.classList.add('disable')
    // 拿到BASE64结果
    const BASE64 = await changeBASE64(file)
    // upload_abbre.style.display = 'block'
    upload_abbre_img.src = BASE64  // 将src属性变成base64编码
    upload_button_select.classList.remove('disable')

  })

  // 触发选择文件事件
  upload_button_select.addEventListener('click', function () {
    if (checkIsDisable(this)) return
    upload_inp.click()
  })

})();


/* 进度管控 */
(function () {
  let upload = document.querySelector('#upload4'),
    upload_inp = upload.querySelector('.upload_inp'),
    upload_button_select = upload.querySelector('.upload_button.select'),
    upload_progress = upload.querySelector('.upload_progress'),
    upload_progress_value = upload_progress.querySelector('.value')

  // 验证是否处于可操作性状态
  const checkIsDisable = element => {
    let classList = element.classList
    return classList.contains('disable') || classList.contains('loading')
  }

  // 文件上传操作
  upload_inp.addEventListener('change', async function () {
    let file = upload_inp.files[0]
    if (!file) return
    upload_button_select.classList.add('loading')
    try {
      let formData = new FormData()
      formData.append('file', file)
      formData.append('filename', file.name)
      const data = await instance.post('/upload_single', formData, {
        // 文件上传中的回调函数 原生使用 xhr.upload.onprogress
        onUploadProgress (ev) {
          let { loaded, total } = ev
          // 计算百分比
          upload_progress.style.display = 'block'
          upload_progress_value.style.width = `${loaded / total * 100}%`
          console.log(ev)
        }
      })
      if (+data.code === 0) {
        upload_progress_value.style.width = `100%`

        await delay(500)
        // alert 会阻碍页面渲染
        alert(`恭喜您，文件上传成功，您可以基于 ${data.servicePath} 访问该文件~~`)
        return
      }
      throw data.codeText
    } catch (err) {
      alert('很遗憾，文件上传失败，请您稍后再试~~')
    } finally {
      upload_button_select.classList.remove('loading')
      upload_progress.style.display = 'none'
      upload_progress_value.style.width = `0%`
    }
  })

  upload_button_select.addEventListener('click', function () {
    if (checkIsDisable(this)) return
    upload_inp.click()
  })
})();


/* 多文件上传 */
(function () {
  let upload = document.querySelector('#upload5'),
    upload_inp = upload.querySelector('.upload_inp'),
    upload_button_select = upload.querySelector('.upload_button.select'),
    upload_button_upload = upload.querySelector('.upload_button.upload'),
    upload_list = upload.querySelector('.upload_list')
  let _files = []

  // 验证是否处于可操作性状态
  const checkIsDisable = element => {
    let classList = element.classList
    return classList.contains('disable') || classList.contains('loading')
  }

  // 把文件上传到服务器
  const changeDisable = flag => {
    if (flag) {
      upload_button_select.classList.add('disable')
      upload_button_upload.classList.add('loading')
      return
    }
    upload_button_select.classList.remove('disable')
    upload_button_upload.classList.remove('loading')
  }
  // 监控点击上传事件
  upload_button_upload.addEventListener('click', async function () {
    if (checkIsDisable(this)) return
    if (_files.length === 0) {
      alert('请您先选择要上传的文件~~')
      return
    }
    changeDisable(true)
    // 循环发送请求
    let upload_list_arr = Array.from(upload_list.querySelectorAll('li'))
    _files = _files.map(item => {
      let fm = new FormData,
        curLi = upload_list_arr.find(liBox => liBox.getAttribute('key') === item.key),
        curSpan = curLi ? curLi.querySelector('span:nth-last-child(1)') : null
      fm.append('file', item.file)
      fm.append('filename', item.filename)
      return instance.post('/upload_single', fm, {
        onUploadProgress (ev) {
          // 检测每一个的上传进度
          if (curSpan) {
            curSpan.innerHTML = `${(ev.loaded / ev.total * 100).toFixed(2)}%` // 保留两位小数
          }
        }
      }).then(data => {
        if (+data.code === 0) {
          if (curSpan) {
            curSpan.innerHTML = `100%`
          }
          return
        }
        return Promise.reject()
      })
    })

    // 等待所有处理的结果
    Promise.all(_files).then(async() => {
      await delay(500)
      alert('恭喜您，所有文件都上传成功~~')
    }).catch(() => {
      alert('很遗憾，上传过程中出现问题，请您稍后再试~~')
    }).finally(() => {
      changeDisable(false)
      _files = []
      upload_list.innerHTML = ''
      upload_list.style.display = 'none'
    })
  })

  // 基于事件委托实现移除的操作
  upload_list.addEventListener('click', function (ev) {
    let target = ev.target, curLi = null, key
    // 移除样式上的li
    if (target.tagName === 'EM') {
      curLi = target.parentNode.parentNode
      if (!curLi) return
      key = curLi.getAttribute('key')
      upload_list.removeChild(curLi)
      // 移除实际数据的li 从_files
      _files = _files.filter(item => item.key !== key)
    }


  })

  // 获取唯一值
  const createRandom = () => {
    let ran = Math.random() * new Date()
    console.log(ran, 'ssss')
    return ran.toString(16).replace('.', '')
  }

  upload_inp.addEventListener('change', async function () {
    // 将输入的文件从类数组转为真正的数组
    _files = Array.from(upload_inp.files)
    if (_files.length === 0) return

    /* 
      插入模版语法 并重构集合的数据结构 给每一项设置一个唯一值，作为自定义属性存储到元素上，
        后期点击删除按钮的时候，我们基于这个自定义属性获取唯一值，再到集合中根据这个唯一值，删除集合中这一项
    */

    _files = _files.map(file => {
      return {
        file,
        filename: file.name,
        key: createRandom()
      }
    })
    console.log(_files, 'files')

    let str = ``
    _files.forEach((item, index) => {
      str += `<li key='${item.key}'>
            <span>文件${index + 1}：${item.filename}</span>
            <span><em>移除</em></span>
          </li>`
    })
    upload_list.innerHTML = str
    upload_list.style.display = 'block'
  })

  upload_button_select.addEventListener('click', function () {
    if (checkIsDisable(this)) return
    upload_inp.click()
  })
})()