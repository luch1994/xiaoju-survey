import fs from 'fs-extra'
const fsa = fs.promises

process.env.XIAOJU_SURVEY_REPORT = 'true'

const readData = async (pkg) => {
  const id = new Date().getTime().toString()
  try {
    if (!fs.existsSync(pkg)) {
      return {
        type: 'web',
        name: '',
        version: '',
        description: '',
        id,
        msg: '文件不存在'
      }
    }
    const data = await fsa.readFile(pkg, 'utf8').catch((e) => e)
    const { name, version, description } = JSON.parse(data)
    return { type: 'web', name, version, description, id }
  } catch (error) {
    return error
  }
}

const report = async () => {
  if (!process.env.XIAOJU_SURVEY_REPORT) {
    return
  }

  const res = await readData('./package.json')

  // 上报
  console.log(1121212121, process.env.XIAOJU_SURVEY_REPORT, res)
}

report()
