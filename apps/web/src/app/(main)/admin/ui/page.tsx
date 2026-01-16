"use client"
import {BaseButton} from "@/components/utils/base/base-button";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import HomeIcon from "@/components/utils/icons/home-icon";
import TopicSortSelector from "@/components/temas/topic-sort-selector";
import React, {ReactNode, useEffect, useState} from "react";
import {TrendingTopicsConfig} from "@/components/layout/main-layout/right-panel/trending-topics/trending-topics-config";
import {SelectPlotType} from "@/components/visualizations/editor/config-panel";
import {DescriptionOnHover} from "@/components/utils/base/description-on-hover";
import {ThemePicker} from "@/components/feed/config/appearance-settings";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {useLoginModal} from "@/components/auth/login-modal-provider";
import {EditProfileButton} from "@/components/perfil/edit-profile-button";
import {toast} from "sonner";
import {BaseTextFieldWithSuggestions} from "@/components/utils/base/base-text-field-with-suggestions";
import {useCategories} from "@/queries/getters/useTopics";
import {ListEditor} from "@/components/utils/base/list-editor";
import {Switch} from "@/components/utils/ui/switch";
import {cn} from "@/lib/utils";
import {Label} from "@radix-ui/react-label";
import {useTheme} from "@/components/layout/theme/theme-context";
import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import DonateIcon from "@/components/utils/icons/donate-icon";
import {DateAndTimePicker} from "@/components/tema/props/date-prop-editor";
import {StateButton} from "@/components/utils/base/state-button"
import {randomBernoulli} from "d3-random";
import { Note } from "@/components/utils/base/note";
import Link from "next/link";
import {TrendingTopicInSlider} from "@/components/layout/main-layout/right-panel/trending-topics/trending-topics-slider";
import {PlotConfigProps} from "@/components/visualizations/editor/types";
import {TTOption} from "@cabildo-abierto/api";
import dynamic from "next/dynamic";
import {usePostEditorSettings} from "@/components/writing/write-panel/use-post-editor-settings";

const CAEditor = dynamic(() => import("@/components/editor/ca-editor").then(mod => mod.CAEditor), {ssr: false})


const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."


const UIDemoSection = ({children, title}: {
    title: string
    children: ReactNode
}) => {
    return <div className={"flex flex-col space-y-4"}>
        <div className={"font-medium uppercase tracking-[0.0167em]"}>
            {title}
        </div>
        <div className={"flex flex-wrap gap-4 items-start"}>
            {children}
        </div>
    </div>
}


const componentToHex = (c: number): string => {
    const hex = c.toString(16)

    return hex.length === 1 ? '0' + hex.toUpperCase() : hex.toUpperCase()
}


const rgbToHex = (rgb: string): string => {
    const match = rgb.match(/\d+/g)

    if (!match || match.length < 3) {
        return rgb
    }

    const [rStr, gStr, bStr] = match

    const r = parseInt(rStr, 10)
    const g = parseInt(gStr, 10)
    const b = parseInt(bStr, 10)

    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`
}

type Palette = Record<string, string>

const PaletteDashboard = () => {
    const {palette, setPalette} = useTheme()
    const [editingPalette, setEditingPalette] = useState<Palette>({})
    const paletteEntries = Object.entries(editingPalette)

    useEffect(() => {
        setEditingPalette(palette)
    }, [palette])

    const handleColorChange = (name: string, newColor: string) => {
        const newPalette = {...editingPalette}
        newPalette[name] = newColor
        setEditingPalette(newPalette)
    }

    return (
        <div className={"space-y-4"}>
            <BaseButton variant={"outlined"} onClick={() => {
                setPalette(editingPalette)
            }}>
                Aplicar
            </BaseButton>
            <div className="grid grid-rows-9 grid-flow-col gap-3">
                {paletteEntries.map(([name, value]) => {
                    const hexValue = rgbToHex(value)

                    return (
                        <div
                            key={name}
                            className="flex space-x-2"
                        >
                            <input
                                type="color"
                                value={hexValue}

                                className="w-14 h-14 cursor-pointer"
                                onChange={(e) => handleColorChange(name, e.target.value)}
                            />
                            <div className="">
                                <p className="text-base font-bold text-text">
                                    {name}
                                </p>
                                <p>
                                    {rgbToHex(value)}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


export default function Page() {
    const [sortedBy, setSortedBy] = useState<TTOption>("Último día")
    const [time, setTime] = useState<string>("día")
    const [category, setCategory] = useState<string>("")
    const [config, setConfig] = useState<PlotConfigProps>({})
    const [text, setText] = useState<string>("Cabildo Abierto")
    const {setLoginModalOpen} = useLoginModal()
    const {data: categories} = useCategories()
    const [list, setList] = useState<string[]>(["cabildo", "abierto"])
    const [portal, setPortal] = useState(false)
    const [date, setDate] = useState<Date>(new Date())
    const settings = usePostEditorSettings(undefined, undefined, undefined, false)

    return <div className="p-8 pb-32">
        <div className={"p-4 space-y-4"}>
            <div className={"flex flex-col space-y-4"}>
                <div className={"border-b pb-4 space-y-4"}>
                    <h1>
                        UI Cabildo
                    </h1>
                    <ThemePicker/>
                    <div className={"space-x-2"}>
                        <Switch
                            id={"portal"}
                            checked={portal}
                            onCheckedChange={setPortal}
                        />
                        <Label className={"font-light text-sm"} htmlFor={"portal"}>
                            Portal
                        </Label>
                    </div>
                </div>
                <div
                    className={cn("grid grid-cols-3 gap-20 pb-4", portal ? "portal panel-dark p-8 bg-[var(--background-dark)] group" : "")}
                >
                    <div className={"flex flex-col space-y-4"}>
                        <UIDemoSection title={"Botones"}>
                            <BaseButton
                                variant={"outlined"}
                                size={"large"}
                                onClick={() => {
                                    setLoginModalOpen(true)
                                }}
                            >
                                Grande
                            </BaseButton>
                            <BaseButton
                                variant={"outlined"}
                                onClick={() => {
                                    setLoginModalOpen(true)
                                }}
                            >
                                Default
                            </BaseButton>
                            <BaseButton
                                variant={"outlined"}
                                size={"small"}
                                onClick={() => {
                                    setLoginModalOpen(true)
                                }}
                            >
                                Chico
                            </BaseButton>
                            <BaseButton
                                onClick={() => {
                                    setLoginModalOpen(true)
                                }}
                            >
                                Texto
                            </BaseButton>
                        </UIDemoSection>

                        <UIDemoSection title={"Íconos"}>
                            <BaseIconButton>
                                <HomeIcon/>
                            </BaseIconButton>
                            <BaseIconButton
                                variant={"outlined"}
                            >
                                <HomeIcon/>
                            </BaseIconButton>
                        </UIDemoSection>

                        <UIDemoSection title={"Botones con íconos"}>
                            <StateButton
                                startIcon={<WriteButtonIcon/>}
                                variant={"outlined"}
                                size={"large"}
                                handleClick={async () => {
                                    const r = randomBernoulli(0.5)()

                                    await new Promise((resolve) => setTimeout(resolve, 1000))

                                    if (r === 1) return {error: "¡Salió cara!"}
                                    return {};
                                }}
                            >
                                Moneda
                            </StateButton>
                            <BaseButton
                                startIcon={<WriteButtonIcon/>}
                                variant={"outlined"}
                                onClick={() => {
                                    setLoginModalOpen(true)
                                }}
                            >
                                Default
                            </BaseButton>
                            <BaseButton
                                startIcon={<WriteButtonIcon/>}
                                variant={"outlined"}
                                size={"small"}
                                onClick={() => {
                                    setLoginModalOpen(true)
                                }}
                            >
                                Chico
                            </BaseButton>
                            <BaseButton
                                startIcon={<DonateIcon/>}
                                onClick={() => {
                                    setLoginModalOpen(true)
                                }}
                            >
                                Texto
                            </BaseButton>
                        </UIDemoSection>

                        <UIDemoSection title={"Input"}>
                            <BaseTextField
                                label={"Nombre"}
                                className={"w-64"}
                                value={text}
                                placeholder={"nombre de usuario..."}
                                onChange={e => setText(e.target.value)}
                            />
                        </UIDemoSection>

                        <UIDemoSection title={"Selector"}>
                            <TrendingTopicsConfig
                                inPortal={portal}
                                time={time}
                                setTime={setTime}
                            />
                            <div className={"w-48"}>
                                <SelectPlotType
                                    config={config}
                                    setConfig={setConfig}
                                    inPortal={portal}
                                />
                            </div>
                        </UIDemoSection>
                    </div>
                    <div className={"flex flex-col space-y-4"}>
                        <UIDemoSection title={"Descripción"}>
                            <DescriptionOnHover description={loremIpsum}
                                                moreInfoHref={"https://google.com"}>
                                <div className={"text-[var(--text-light)]"}>
                                    Pasá el mouse por acá.
                                </div>
                            </DescriptionOnHover>
                        </UIDemoSection>
                        <UIDemoSection title={"Dropdown"}>
                            <TopicSortSelector
                                sortedBy={sortedBy}
                                setSortedBy={setSortedBy} disabled={false}
                            />
                        </UIDemoSection>
                        <UIDemoSection title={"Editar perfil"}>
                            <EditProfileButton/>
                        </UIDemoSection>
                        <UIDemoSection title={"Evento"}>
                            <BaseButton
                                variant={"outlined"}
                                onClick={() => {
                                    toast.success("¡Algo pasó!")
                                }}
                            >
                                Click acá
                            </BaseButton>
                        </UIDemoSection>
                    </div>
                    <div className={"flex flex-col space-y-4"}>
                        <UIDemoSection title={"Dropdown con búsqueda"}>
                            <BaseTextFieldWithSuggestions
                                className={"w-64"}
                                options={categories}
                                onChange={(v) => {
                                    setCategory(v)
                                }}
                                value={category}
                                placeholder={"Ingresá una categoría..."}
                            />
                        </UIDemoSection>
                        <UIDemoSection title={"Editor de listas"}>
                            <ListEditor
                                items={list}
                                options={categories}
                                setItems={setList}
                            />
                        </UIDemoSection>
                        <UIDemoSection title={"Calendario"}>
                            <DateAndTimePicker value={date} onChange={setDate} label={true}/>
                        </UIDemoSection>
                        <UIDemoSection title={"Nota"}>
                            <Note>
                                Conocé más sobre Cabildo Abierto en <Link href={"https://google.com"}>este
                                enlace.</Link>
                            </Note>
                        </UIDemoSection>
                        <UIDemoSection title={"Tendencia"}>
                            <TrendingTopicInSlider
                                selected={"day"}
                                topic={{
                                    $type: "ar.cabildoabierto.wiki.topicVersion#topicViewBasic",
                                    id: "Dólar",
                                    props: [{
                                        $type: "ar.cabildoabierto.wiki.topicVersion#topicProp",
                                        name: "Categorías",
                                        value: {
                                            $type: "ar.cabildoabierto.wiki.topicVersion#stringListProp",
                                            value: ["Economía"]
                                        }
                                    }],
                                    popularity: {
                                        lastDay: [14],
                                        lastWeek: [32],
                                        lastMonth: [83]
                                    }
                                }}
                            />
                        </UIDemoSection>
                    </div>

                </div>
            </div>
            <div className={"border-t pt-4 space-y-4 pb-64"}>
                <h2 className={"uppercase text-lg"}>
                    Editor
                </h2>
                <CAEditor
                    settings={settings}
                    setEditor={() => {}}
                    setEditorState={() => {}}
                />
            </div>
            <div className={"border-t pt-4 space-y-4"}>
                <h2 className={"uppercase text-lg"}>
                    Paleta de colores
                </h2>
                <PaletteDashboard/>
            </div>
        </div>
    </div>
}