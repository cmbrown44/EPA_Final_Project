export function ApiPath() {

    const apiDomain = 'qwiz-api.ncharlbr.people.aws.dev'

    const domainCDN = window.location.host.toLowerCase()

    console.log(domainCDN)

    const hasPrefix = domainCDN.includes("alpha" || "gamma")

    if (hasPrefix == true) {
        const usePrefix = window.location.host.toLowerCase().split('.')[0].replace("qwiz", "")
        console.log('this is the prefix created: ' + usePrefix)
        return usePrefix + apiDomain
    }
    else { return apiDomain }
}

export function createApiPath() {

    const apiUrl = 'https://' + ApiPath()

    console.log('this is the url created: ' + apiUrl)

    return apiUrl
}