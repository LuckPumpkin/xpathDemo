const https = require('https');
const fs = require("fs");

const xpath = require('xpath')
const dom = require('xmldom').DOMParser;

const url = "https://movie.douban.com/subject/3001114/comments?sort=new_score&status=P"; 
let startTimeRe = ''
let endTimeRe = ''

let startTimeXpath = ''
let endTimeXpath = ''

const getData=(type, l, obj, html)=>{
    let result = []
    let keys = Object.keys(obj)
    for(item in obj){
        obj[item] = type=="regex" ? matchListByRegexp(html, obj[item].regex, '' , '' ) :  xpath.select(obj[item].xpath, html)
    }
    for(let i=0; i<l; i++) {
        let object = {}
        for(let j=0; j<keys.length; j++) {
            object[keys[j]] = type=="regex" ? obj[keys[j]][i] : obj[keys[j]][i].nodeValue
        }
        result[i] = object
    }
    return result
}

const matchListByRegexp=(originString, regexpString)=>{
    const result = []
    const regExp = new RegExp(regexpString, 'g')
    const list = [...originString.matchAll(regExp)]
    if(!list) return []

    list.forEach(item => {
      const value = item.groups && item.groups["v"] ? item.groups["v"] : item[0]
      result.push(value)
    })
    return result
}

const  matchByRegexp=(originString, regexpString, )=>{
    const regExp = new RegExp(regexpString, '')
    const matchedResult = originString.match(regExp)
    if(!matchedResult) return ''
    if(!matchedResult.groups) return matchedResult[0]
    return  'v' in matchedResult.groups ? matchedResult.groups.v : matchedResult[1]
}
https.get(url, (res)=>{
    let result = ''
    res.on('data', (data)=> {
        result += data
    })
    res.on('end', function () {
      fs.writeFile("./html.html", result, error=>{
        if(error) console.log(error.message)
        let html = new dom().parseFromString(result)
        // https://movie.douban.com/review/best/   最受欢迎影评
        
        let title = xpath.select(`translate(//div[contains(@class, "nav-logo")]/a, "电影","南瓜")`, html)
        console.log(title)
        // let parent = xpath.select(`//div[contains(@class,"main review-item")]`, html)
        // // 头像
        // let picture = xpath.select(`//header/a[@class="avator"]/img/@src`, html)
        // // 名字 
        // let name = xpath.select(`//header/a[@class="name"]//text()`, html)
        // // 时间
        // let time = xpath.select(`//header/span[@class='main-meta']//text()`,html)
        // // 电影图片
        // let pic = xpath.select(`//a[@class='subject-img']/img/@src`,html)
        // // 电影概述
        // let head = xpath.select(`//div[@class='main-bd']/h2/a//text()`,html)
        // // 评论
        // let content = xpath.select(`string(//div[@class="short-content"])`, html)
        // https://movie.douban.com/subject/3001114/?tag=%E7%83%AD%E9%97%A8&from=gaia  某电影解析
        // let title = xpath.select(`//h1/span[1]//text()`, html)
        // console.log(title)

        let res = []
        let p =xpath.select(`//div[@class='comment-item ']`, html)
        let commenters = xpath.select(`//div[contains(@class, 'comment')]/h3/span[@class='comment-info']/a//text()`, html)

        let commentTimes = xpath.select(`//span[@class='comment-info']/span[@class='comment-time ']//text()`, html)

        let commentContents = xpath.select(`//p[@class=' comment-content']/span//text()`, html)
        for(let i = 0; i<p.length; i++) {
            res.push({
                commenter: commenters[i].nodeValue,
                commentTime: commentTimes[i].nodeValue,
                commentContent: commentContents[i].nodeValue
            })
        }
        // console.log(p)
      }),
      fs.readFile("./regex.json", 'utf-8', (error,data)=>{
            let obj = JSON.parse(data)
            startTimeRe = new Date().getTime()

            let _res = {}
            for(item in obj) {
                if(obj[item].children) {
                    // regex
                    let l = matchListByRegexp(result, obj[item].regex)
                    _res[item]= getData('regex', l.length|| 0, obj[item].children,matchByRegexp(result, obj[item].parentre))
                } else {
                    // 
                }
            }
            // console.log(_res)
            // endTimeRe = new Date().getTime()
            // console.log(startTimeRe,endTimeRe,endTimeRe-startTimeRe )
      })
    //   fs.readFile("./template.json", 'utf-8', (error,data)=>{
    //         let obj = JSON.parse(data)
    //         startTimeXpath = new Date().getTime()

    //         // xpath
    //         let html = new dom().parseFromString(result)
    //         let _res = {}
    //         for(item in obj) {
    //             if(obj[item].children) {
    //                 // xpath
    //                  _res[item] =  getData('xpath', xpath.select(obj[item].xpath, html)||0,obj[item].children, html)
    //             } else {
                    
    //             }
    //         }
    //         // console.log(_res)
    //         // endTimeXpath = new Date().getTime()
    //         // console.log(endTimeXpath-startTimeXpath)
    //   })
    });
}).on('error', ()=>{
    console.log('error')
})

