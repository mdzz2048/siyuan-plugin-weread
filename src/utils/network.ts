// REF: [前端面试题：实现批量请求数据，并控制请求并发数量，最后所有请求结束之后，执行callback回调函数](https://blog.csdn.net/weixin_42655717/article/details/118862407)
export function sendRequest(max: number, reqBodys: any[], reqFun: Function, callback: () => void) {
    let currentReqNumber = 0 // 当前请求的数量
    let finishedReqNumber = 0 // 已完成的请求数量
    const blockQueue = [] // 等待队列
    const results = new Array(reqBodys.length) // 请求结果列表

    for (let index = 0; index < reqBodys.length; index++) {
        request(index, reqBodys[index])
    }

    async function request(index: number, body: any) {
        if (currentReqNumber >= max) {
            await new Promise((resolve) => blockQueue.push(resolve))
            // console.log("第 " + index + " 请求等待结束")
        }
        reqHandler(index, body)
    }

    async function reqHandler(index: number, body: any) {
        currentReqNumber++
        try {
            const result = await reqFun(...body)
            results[index] = result
        } catch(err) {
            results[index] = err
        } finally {
            currentReqNumber--
            finishedReqNumber++
            // console.log("已完成: " + finishedReqNumber + " 个请求")
            if (blockQueue.length) {
                // 每完成一个就从阻塞队列里剔除一个
                blockQueue[0](); // 将最先进入阻塞队列的 Promise 从 Pending 变为 Fulfilled
                blockQueue.shift();
                // console.log("排队数为: " + blockQueue.length)
            }
            if (finishedReqNumber === reqBodys.length) {
                callback()
            }
        }
    }
}