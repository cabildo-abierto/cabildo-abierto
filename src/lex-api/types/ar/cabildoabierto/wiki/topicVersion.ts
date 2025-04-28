/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../../lexicons'
import {
  type $Typed,
  is$typed as _is$typed,
  type OmitKey,
} from '../../../../util'
import type * as ArCabildoabiertoActorDefs from '../actor/defs.js'
import type * as AppBskyActorDefs from '../../../app/bsky/actor/defs.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.wiki.topicVersion'

export interface Record {
  $type: 'ar.cabildoabierto.wiki.topicVersion'
  id: string
  text: BlobRef
  format?: string
  props?: TopicProp[]
  message?: string
  createdAt: string
  [k: string]: unknown
}

const hashRecord = 'main'

export function isRecord<V>(v: V) {
  return is$typed(v, id, hashRecord)
}

export function validateRecord<V>(v: V) {
  return validate<Record & V>(v, id, hashRecord, true)
}

export interface TopicView {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#topicView'
  id: string
  uri: string
  cid: string
  currentVersion?: string
  text: string
  format?: string
  props?: TopicProp[]
  lastEdit: string
  createdAt: string
  author: ArCabildoabiertoActorDefs.ProfileViewBasic
}

const hashTopicView = 'topicView'

export function isTopicView<V>(v: V) {
  return is$typed(v, id, hashTopicView)
}

export function validateTopicView<V>(v: V) {
  return validate<TopicView & V>(v, id, hashTopicView)
}

export interface TopicHistory {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#topicHistory'
  id: string
  versions: VersionInHistory[]
}

const hashTopicHistory = 'topicHistory'

export function isTopicHistory<V>(v: V) {
  return is$typed(v, id, hashTopicHistory)
}

export function validateTopicHistory<V>(v: V) {
  return validate<TopicHistory & V>(v, id, hashTopicHistory)
}

export interface VersionInHistory {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#versionInHistory'
  uri: string
  cid: string
  createdAt: string
  author: AppBskyActorDefs.ProfileViewBasic
  message?: string
  viewer?: TopicVersionViewerState
  status?: TopicVersionStatus
  addedChars?: number
  removedChars?: number
  props?: TopicProp[]
}

const hashVersionInHistory = 'versionInHistory'

export function isVersionInHistory<V>(v: V) {
  return is$typed(v, id, hashVersionInHistory)
}

export function validateVersionInHistory<V>(v: V) {
  return validate<VersionInHistory & V>(v, id, hashVersionInHistory)
}

export interface TopicVersionViewerState {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#topicVersionViewerState'
  accept?: string
  reject?: string
}

const hashTopicVersionViewerState = 'topicVersionViewerState'

export function isTopicVersionViewerState<V>(v: V) {
  return is$typed(v, id, hashTopicVersionViewerState)
}

export function validateTopicVersionViewerState<V>(v: V) {
  return validate<TopicVersionViewerState & V>(
    v,
    id,
    hashTopicVersionViewerState,
  )
}

export interface TopicVersionStatus {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#topicVersionStatus'
  voteCounts: CategoryVotes[]
}

const hashTopicVersionStatus = 'topicVersionStatus'

export function isTopicVersionStatus<V>(v: V) {
  return is$typed(v, id, hashTopicVersionStatus)
}

export function validateTopicVersionStatus<V>(v: V) {
  return validate<TopicVersionStatus & V>(v, id, hashTopicVersionStatus)
}

export interface CategoryVotes {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#categoryVotes'
  accepts: number
  rejects: number
  category: string
}

const hashCategoryVotes = 'categoryVotes'

export function isCategoryVotes<V>(v: V) {
  return is$typed(v, id, hashCategoryVotes)
}

export function validateCategoryVotes<V>(v: V) {
  return validate<CategoryVotes & V>(v, id, hashCategoryVotes)
}

export interface TopicProp {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#topicProp'
  name: string
  value: string
  dataType?: string
}

const hashTopicProp = 'topicProp'

export function isTopicProp<V>(v: V) {
  return is$typed(v, id, hashTopicProp)
}

export function validateTopicProp<V>(v: V) {
  return validate<TopicProp & V>(v, id, hashTopicProp)
}

export interface TopicViewBasic {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#topicViewBasic'
  id: string
  props?: TopicProp[]
  popularity?: number[]
  lastEdit?: string
}

const hashTopicViewBasic = 'topicViewBasic'

export function isTopicViewBasic<V>(v: V) {
  return is$typed(v, id, hashTopicViewBasic)
}

export function validateTopicViewBasic<V>(v: V) {
  return validate<TopicViewBasic & V>(v, id, hashTopicViewBasic)
}
