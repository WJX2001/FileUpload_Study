/* 把axios发送请求的公共信息进行提取 */
let instance = axios.create();
instance.defaults.baseURL = 'http://127.0.0.1:8888';
instance.defaults.headers['Content-Type'] = 'multipart/form-data';
instance.defaults.transformRequest = (data, headers) => {
    const contentType = headers['Content-Type'];
    if (contentType === "application/x-www-form-urlencoded") return Qs.stringify(data);
    return data;
};
instance.interceptors.response.use(response => {
    return response.data;
});

// // 响应拦截器
// instance.interceptors.response.use(response => {
//   return response.data
// },reason => {
//   // 统一做失败的提示处理即可
//   // ...
//   return Promise.reject(reason) 
// })



