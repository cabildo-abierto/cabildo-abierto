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
import type * as ArCabildoabiertoFeedArticle from '../feed/article'
import type * as ArCabildoabiertoActorDefs from '../actor/defs'

const is$typed = _is$typed,
  validate = _validate
const id = 'ar.cabildoabierto.wiki.topicVersion'

export interface Record {
  $type: 'ar.cabildoabierto.wiki.topicVersion'
  id: string
  text?: BlobRef
  format?: string
  props?: TopicProp[]
  embeds?: ArCabildoabiertoFeedArticle.ArticleEmbed[]
  message?: string
  createdAt: string
  claimsAuthorship?: boolean
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
  record?: { [_ in string]: unknown }
  text: string
  format?: string
  props?: TopicProp[]
  lastEdit: string
  createdAt: string
  embeds?: ArCabildoabiertoFeedArticle.ArticleEmbedView[]
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
  protection?: string
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
  author: ArCabildoabiertoActorDefs.ProfileViewBasic
  message?: string
  viewer?: TopicVersionViewerState
  status?: TopicVersionStatus
  addedChars?: number
  removedChars?: number
  prevAccepted?: string
  contribution?: TopicVersionContribution
  props?: TopicProp[]
  claimsAuthorship?: boolean
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
  value:
    | $Typed<StringProp>
    | $Typed<StringListProp>
    | $Typed<DateProp>
    | $Typed<NumberProp>
    | $Typed<BooleanProp>
    | { $type: string }
}

const hashTopicProp = 'topicProp'

export function isTopicProp<V>(v: V) {
  return is$typed(v, id, hashTopicProp)
}

export function validateTopicProp<V>(v: V) {
  return validate<TopicProp & V>(v, id, hashTopicProp)
}

export interface StringProp {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#stringProp'
  value: string
}

const hashStringProp = 'stringProp'

export function isStringProp<V>(v: V) {
  return is$typed(v, id, hashStringProp)
}

export function validateStringProp<V>(v: V) {
  return validate<StringProp & V>(v, id, hashStringProp)
}

export interface BooleanProp {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#booleanProp'
  value: boolean
}

const hashBooleanProp = 'booleanProp'

export function isBooleanProp<V>(v: V) {
  return is$typed(v, id, hashBooleanProp)
}

export function validateBooleanProp<V>(v: V) {
  return validate<BooleanProp & V>(v, id, hashBooleanProp)
}

export interface StringListProp {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#stringListProp'
  value: string[]
}

const hashStringListProp = 'stringListProp'

export function isStringListProp<V>(v: V) {
  return is$typed(v, id, hashStringListProp)
}

export function validateStringListProp<V>(v: V) {
  return validate<StringListProp & V>(v, id, hashStringListProp)
}

export interface DateProp {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#dateProp'
  value: string
}

const hashDateProp = 'dateProp'

export function isDateProp<V>(v: V) {
  return is$typed(v, id, hashDateProp)
}

export function validateDateProp<V>(v: V) {
  return validate<DateProp & V>(v, id, hashDateProp)
}

export interface NumberProp {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#numberProp'
  value: number
}

const hashNumberProp = 'numberProp'

export function isNumberProp<V>(v: V) {
  return is$typed(v, id, hashNumberProp)
}

export function validateNumberProp<V>(v: V) {
  return validate<NumberProp & V>(v, id, hashNumberProp)
}

export interface TopicViewBasic {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#topicViewBasic'
  id: string
  props?: TopicProp[]
  popularity?: TopicPopularity
  lastEdit?: string
  currentVersionCreatedAt?: string
  numWords?: number
  lastSeen?: string
}

const hashTopicViewBasic = 'topicViewBasic'

export function isTopicViewBasic<V>(v: V) {
  return is$typed(v, id, hashTopicViewBasic)
}

export function validateTopicViewBasic<V>(v: V) {
  return validate<TopicViewBasic & V>(v, id, hashTopicViewBasic)
}

export interface TopicVersionContribution {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#topicVersionContribution'
  monetized: string
  all: string
}

const hashTopicVersionContribution = 'topicVersionContribution'

export function isTopicVersionContribution<V>(v: V) {
  return is$typed(v, id, hashTopicVersionContribution)
}

export function validateTopicVersionContribution<V>(v: V) {
  return validate<TopicVersionContribution & V>(
    v,
    id,
    hashTopicVersionContribution,
  )
}

export interface TopicPopularity {
  $type?: 'ar.cabildoabierto.wiki.topicVersion#topicPopularity'
  lastDay: number[]
  lastWeek: number[]
  lastMonth: number[]
}

const hashTopicPopularity = 'topicPopularity'

export function isTopicPopularity<V>(v: V) {
  return is$typed(v, id, hashTopicPopularity)
}

export function validateTopicPopularity<V>(v: V) {
  return validate<TopicPopularity & V>(v, id, hashTopicPopularity)
}
