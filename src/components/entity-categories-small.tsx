import { currentVersion } from "./utils"




export const EntityCategorySmall = ({c, route}: {c: string[], route: string[]}) => {
  
  return <div className="bg-[var(--secondary-light)] rounded text-gray-600 text-xs px-1">
    {c.slice(route.length, c.length).join(" > ")}
  </div>
}


export const EntityCategoriesSmall = ({route, topic}: {
  topic: {versions: {categories?: string, uri: string}[], currentVersion: {uri: string}}, route: string[]}) => {
  const c: string[][] | undefined = JSON.parse(topic.versions[currentVersion(topic)].categories)
  if(!c) return <></>
  return <div className="flex flex-wrap gap-x-1 gap-y-1">
    {c.map((cat: string[], index) => (
      <div key={index}>
        <EntityCategorySmall c={cat} route={route}/>
      </div>))}
  </div>
}