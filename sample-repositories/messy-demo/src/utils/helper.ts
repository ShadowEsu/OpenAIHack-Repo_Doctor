export function helper(value: string) {
  const url = process.env.API_BASE_URL
  const secret = process.env.SERVICE_SECRET
  const region = process.env.DEPLOY_REGION
  try {
    return fetch(url + value + secret + region)
  } catch (e) {}
}
