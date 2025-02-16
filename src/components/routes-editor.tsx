"use client"

import { useState } from "react"
import { areArraysEqual } from "@mui/base";
import StateButton from "./state-button";
import {currentCategories} from "./utils";
import { TopicProps } from "../app/lib/definitions";
import {BasicButton} from "./ui-utils/basic-button";
import {IconButton} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import {updateCategoriesInTopic} from "../actions/topics";

function validCategoryElement(e: string){
    return e.length > 0
}

function validCategories(categories: string[]){
    return categories.length > 0 && !categories.some((e) => !validCategoryElement(e))
}


const CategoryInput = ({
    isNew,
    update,
    category,
    availableCategories,
    id
  }: {
    isNew: boolean;
    update: (v: string) => void;
    category: string;
    availableCategories: string[]
    id: string
  }) => {
    return (
      <div>
        <input
          list={id}
          className={
            "border px-2 mx-1 py-1 rounded outline-none w-48 bg-[var(--background)] my-1" +
            (isNew ? " border-[var(--primary)] border-2" : " border-[var(--accent)]")
          }
          placeholder={category}
          value={category}
          onChange={(e) => {
            update(e.target.value);
          }}
        />
        <datalist id={id}>
          {availableCategories.map((cat, index) => {
            return (
            <option key={index} value={cat} />
          )})}
        </datalist>
      </div>
    );
};


const NewCategory = ({addCategory}: {addCategory: (c: string) => void}) => {
    const [category, setCategory] = useState("")
    const [writingCategory, setWritingCategory] = useState(false)

    if(writingCategory){
        return <div className={"space-x-2 flex items-center"}>
            <input
                value={category}
                className={"rounded-lg bg-[var(--accent)] py-1 px-2 outline-none"}
                autoFocus={true}
                onChange={(e) => {setCategory(e.target.value)}}
            />
            <IconButton onClick={() => {addCategory(category); setCategory(""); setWritingCategory(false)}}>
                <CheckIcon fontSize="small"/>
            </IconButton>
            <IconButton onClick={() => {setCategory(""); setWritingCategory(false)}}>
                <CloseIcon fontSize="small"/>
            </IconButton>
        </div>
    }

    return <IconButton size="small" onClick={() => {setWritingCategory(true)}}>
        <AddIcon fontSize={"small"}/>
    </IconButton>
}


export const Category = ({category, removeCategory}: {category: string, removeCategory: () => void}) => {
    const [hovering, setHovering] = useState(false)
    return <button className={"px-2 py-1 border rounded-lg bg-[var(--accent)] flex space-x-1 items-center"}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={removeCategory}
    >
        <div>
        {category}
        </div>
        {hovering ? <CloseIcon fontSize={"small"}/> : null}
    </button>
}


export const RoutesEditor = ({topic, setEditing}: {topic: TopicProps, setEditing: (v: boolean) => void}) => {
    const current = currentCategories(topic)
    const [categories, setCategories] = useState(current)


    function removeCategory(i: number) {
        return () => {
            setCategories([...categories.slice(0, i), ...categories.slice(i+1)])
        }
    }


    async function saveCategories(){
        await updateCategoriesInTopic({topicId: topic.id, categories})
        setEditing(false)
        return {}
    }


    return <div className={"px-2"}>
        {categories.length == 0 && <div className={"mb-2 text-[var(--text-light)]"}>Tocá el + para agregar una categoría.</div>}
        <div className={"flex flex-wrap gap-x-2 items-center"}>
            {categories.map((c, i) => {
                return <div key={i}>
                    <Category category={c} removeCategory={removeCategory(i)}/>
                </div>
            })}
            <NewCategory addCategory={(c: string) => {setCategories([...categories, c])}}/>
        </div>
        <div className={"flex justify-end mt-2 space-x-2"}>
            <BasicButton
                variant={"text"}
                onClick={() => {setCategories(current)}}
                disabled={areArraysEqual(current, categories)}
            >
                Cancelar
            </BasicButton>
            <StateButton
                handleClick={saveCategories}
                disabled={areArraysEqual(current, categories)}
                text1={"Guardar categorías"}
            />
        </div>
    </div>
}