import senadores from "../../../public/congreso/senadores.json";
import diputados from "../../../public/congreso/diputados.json";
import Image from "next/image";
import React, {useEffect, useState} from "react";
import {useLayoutConfig} from "../layout/layout-config-context";
import {CongressProject, CongressResult} from "./proyectos";
import {getId, getVote} from "./utils";
import Link from "next/link";
import {CustomLink} from "../../../modules/ui-utils/src/custom-link";
import {pxToNumber} from "../../utils/strings";
import {useRouter} from "next/navigation"


type SelectedSenator = {
    x: number
    y: number
    rowIndex: number
    seatIndex: number
}

const defaultImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/eqvDYkAAAAASUVORK5CYII="


function getRows(total: number, n: number){
    const rowsize = Math.ceil(total / n)
    return [...new Array(n-1).fill(rowsize), total - rowsize * (n-1)]
}


function seatToIndex(s: {rowIndex: number, seatIndex: number}) {
    return s.rowIndex*18 + s.seatIndex
}

function toTitleCase(str) {
    return str.toLowerCase().split(" ").map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
}

export const BancasSenadores = ({project}: {project?: CongressProject}) => {
    const rows = getRows(72, 4)

    const radiusStep = (_: number) => {
        return 45
    }
    const seatRadius = (rowIndex: number) => {
        return 5 * Math.sqrt(rowIndex + 1);
    }

    function generator(rowIndex: number, seatIndex: number): Seat {
        const idx = seatToIndex({rowIndex, seatIndex})

        if(idx < senadores.table.rows.length){
            const s = senadores.table.rows[idx]
            const name = toTitleCase(s.NOMBRE + " " + s.APELLIDO)
            return {
                name: name,
                img: s.FOTO,
                distrito: s.PROVINCIA,
                bloque: s.BLOQUE,
                partido: s["PARTIDO O ALIANZA"],
                vote: project ? getVote(getId(s), project.votesSenado) : undefined,
                profileUrl: "/tema?i=" + name
            }
        } else {
            return {
                name: "SILLA VACÍA",
                img: defaultImg,
                distrito: null,
                bloque: null,
                partido: null,
                profileUrl: null
            }
        }
    }

    return <div className={"flex flex-col items-center"}>
        {project && <div className={"text-xl mt-4"}>
            <CongressResult
                project={project}
                camara={"Senadores"}
                className={"px-4 space-x-4 py-1"}
            />
        </div>}
        <Bancas
            rows={rows}
            radiusStep={radiusStep}
            seatRadius={seatRadius}
            generator={generator}
        />
    </div>
}

export const BancasDiputados = ({project}: {project: CongressProject}) => {
    const rows = getRows(257, 8)

    const radiusStep = (_: number) => {
        return 24
    }

    const seatRadius = (rowIndex: number) => {
        return 2 * Math.pow(rowIndex + 1, 0.4);
    }

    function generator(rowIndex: number, seatIndex: number): Seat {
        const idx = seatToIndex({rowIndex, seatIndex})
        if(idx < diputados.length){
            const d = diputados[idx]
            const name = toTitleCase(d.Nombre + " " + d.Apellido)
            return {
                name: name,
                img: d.Foto,
                distrito: d.Distrito,
                bloque: d.Bloque,
                profileUrl: "/tema?i=" + name
            }
        } else {
            return {
                name: "Silla vacía",
                img: null,
                distrito: null,
                bloque: null,
                profileUrl: null
            }
        }
    }

    return <div className={"flex flex-col items-center"}>
        {project && <div className={"text-xl mt-4"}>
            <CongressResult
                project={project}
                camara={"Diputados"}
                className={"px-4 space-x-4 py-1"}
            />
        </div>}
        <Bancas
            rows={rows}
            radiusStep={radiusStep}
            seatRadius={seatRadius}
            generator={generator}
        />
    </div>
}


type Seat = {
    img: string
    name: string
    distrito: string
    bloque: string
    vote?: string
    partido?: string
    profileUrl?: string
}


const SeatCard = ({
                      hoveredSeat,
                      generator,
                      canvasWidth,
                      canvasHeight,
                      svgWidth,
                      svgHeight
                  }: {
    hoveredSeat: SelectedSenator,
    generator: (rowIndex: number, seatIndex: number) => Seat
    canvasWidth: number
    canvasHeight: number
    svgWidth: number
    svgHeight: number
}) => {
    const s = generator(hoveredSeat.rowIndex, hoveredSeat.seatIndex)

    return <div
        className="absolute w-[300px] z-[1001]"
        style={{
            top: hoveredSeat.y * canvasHeight / svgHeight + 5,
            left: hoveredSeat.x * canvasWidth / svgWidth + 5,
        }}
    >
        <div className={"p-2 w-[300px] flex space-x-2 border rounded-lg bg-[var(--background-dark)]"}>
            {generator(hoveredSeat.rowIndex, hoveredSeat.seatIndex).img &&
                <CustomLink href={s.profileUrl} className={"w-20"}>
                    <Image
                        src={s.img}
                        alt={"Foto de " + s.name}
                        width={300}
                        height={300}
                        className={"rounded-full w-20 h-20"}
                    />
                </CustomLink>
            }
            <div className={"text-transform: capitalize w-[180px]"}>
                <Link href={s.profileUrl} className="font-semibold">
                    {s.name.toLowerCase()}
                </Link>
                <div className={"mt-1 text-sm"}>
                    {s.distrito.toLowerCase()}
                </div>
                {s.partido && <div className={"mt-1 text-sm text-[var(--text-light)]"}>
                    <div className={"text-xs"}>Partido</div>
                    <div className={"font-semibold"}>{s.partido.toLowerCase()}</div>
                </div>}
                {s.bloque && s.bloque.length > 0 && <div className={"mt-1 text-sm truncate w-full text-[var(--text-light)]"}>
                    <div className={"text-xs"}>Bloque</div>
                    <div className={"truncate w-full break-all font-semibold"}>{s.bloque.toLowerCase()}</div>
                </div>}
            </div>
        </div>
    </div>
}


const Bancas = ({rows, radiusStep, seatRadius, generator}: {
    rows: number[]
    radiusStep: (rowIndex: number) => number
    seatRadius: (rowIndex: number) => number
    generator: (rowIndex: number, seatIndex: number) => Seat
}) => {
    const [hoveredSeat, setHoveredSeat] = useState<SelectedSenator>(null)
    const [hoveredCard, setHoveredCard] = useState<SelectedSenator>(null)
    const {layoutConfig} = useLayoutConfig()
    const [canvasWidth, setCanvasWidth] = useState(pxToNumber(Math.min(window.innerWidth, pxToNumber(layoutConfig.maxWidthCenter))))
    const router = useRouter()

    useEffect(() => {
        const handleResize = () => {
            let newCanvasWidth: number
            if(window.innerWidth < 500){
                newCanvasWidth = pxToNumber(Math.min(window.innerWidth, pxToNumber(layoutConfig.maxWidthCenter)))
            } else {
                newCanvasWidth = pxToNumber(Math.min(window.innerWidth-80, pxToNumber(layoutConfig.maxWidthCenter)))
            }
            if(newCanvasWidth != canvasWidth){
                setCanvasWidth(newCanvasWidth)
            }
        };

        window.addEventListener("resize", handleResize);

        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [layoutConfig]);

    const canvasHeight = canvasWidth * 0.55
    const svgWidth = 400
    const svgHeight = svgWidth * 0.55
    const centerX = svgWidth / 2;
    const centerY = svgHeight * 15 / 16;

    const selectedSeat = hoveredCard ? hoveredCard : hoveredSeat

    return (
        <div className={"flex justify-center"}>
            <div className="w-full relative">
                <svg
                    viewBox={"0 0 " + svgWidth + " " + svgHeight}
                    className=""
                    style={{width: canvasWidth, height: canvasHeight}}
                >

                    {rows.map((rowLength, rowIndex) => {
                        const rowRadius = (rowIndex + 1) * radiusStep(rowIndex);
                        const angleStep = Math.PI / (rowLength - 1);

                        return (
                            <g key={rowIndex}>
                                {Array.from({length: rowLength}).map((_, seatIndex) => {
                                    const angle = angleStep * seatIndex;
                                    const x = centerX - rowRadius * Math.cos(angle);
                                    const y = centerY - rowRadius * Math.sin(angle);
                                    const r = seatRadius(rowIndex)

                                    const href = generator(rowIndex, seatIndex).img

                                    const vote = generator(rowIndex, seatIndex).vote
                                    let color = "stroke-transparent"
                                    if (vote) {
                                        if (vote == "Afirmativo") color = "stroke-green-600"
                                        else if (vote == "Negativo") color = "stroke-red-600"
                                        else if (vote == "Abstención") color = "stroke-blue-600"
                                    }

                                    const link = generator(rowIndex, seatIndex).profileUrl

                                    if (href) {
                                        return <svg
                                            key={`${rowIndex}:${seatIndex}`}
                                        >
                                            <image
                                                href={href}
                                                x={x - r}
                                                y={y - r}
                                                width={r * 2}
                                                height={r * 2}
                                                className="cursor-pointer"
                                                style={{
                                                    clipPath: "circle(50%)"
                                                }}
                                                onMouseEnter={() => {
                                                    setHoveredSeat({x, y, rowIndex, seatIndex})
                                                }}
                                                onMouseLeave={() => {
                                                    setHoveredSeat(null);
                                                }}
                                            />
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r={r * 1.05}
                                                onClick={() => {router.push(link)}}
                                                className={"stroke-1 fill-transparent cursor-pointer " + color}
                                                onMouseEnter={() => {
                                                    setHoveredSeat({x, y, rowIndex, seatIndex})
                                                }}
                                                onMouseLeave={() => {
                                                    setHoveredSeat(null);
                                                }}
                                            />
                                        </svg>
                                    } else {
                                        return <circle
                                            key={rowIndex + ":" + seatIndex}
                                            cx={x}
                                            cy={y}
                                            r={r}
                                            className="fill-[var(--background-dark2)] stroke-1 stroke-[var(--accent)] cursor-pointer"
                                            onMouseEnter={() => {
                                                setHoveredSeat({x, y, rowIndex, seatIndex})
                                            }}
                                            onMouseLeave={() => {
                                                setHoveredSeat(null)
                                            }}
                                        />
                                    }
                                })}
                            </g>
                        );
                    })}
                </svg>

                {selectedSeat && (
                    <div
                        onMouseEnter={() => {
                            setHoveredCard(hoveredSeat)
                        }}
                        onMouseLeave={() => {
                            setHoveredCard(null);
                        }}
                    >
                        <SeatCard
                            hoveredSeat={selectedSeat}
                            generator={generator}
                            canvasWidth={canvasWidth}
                            canvasHeight={canvasHeight}
                            svgWidth={svgWidth}
                            svgHeight={svgHeight}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};