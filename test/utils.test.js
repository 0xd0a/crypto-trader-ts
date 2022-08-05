import {genHexId, genHexId2} from '../src/utils/util'

test("genHexId", async() => {
    const hexid=genHexId(12)
    console.log(hexid)
    console.log(genHexId2(12))
})