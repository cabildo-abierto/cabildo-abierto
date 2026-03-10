import {Logo} from "@/components/utils/icons/logo";
import {Note} from "../utils/base/note";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {BaseButton} from "@/components/utils/base/base-button";
import {LoginModalPage} from "@/components/auth/login-modal";
import Link from "next/link";
import {topicUrl} from "@/components/utils/react/url";
import {useState} from "react";
import {AtIcon, CheckCircleIcon, EyeClosedIcon, EyeIcon, XCircleIcon} from "@phosphor-icons/react";
import {isValidHandle} from "@atproto/syntax";
import {post} from "@/components/utils/react/fetch";
import {SignupOutput, SignupParams} from "@cabildo-abierto/api";
import {StateButton, StateButtonClickHandler} from "@/components/utils/base/state-button";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {isValidEmail} from "@/components/feed/config/account-settings";
import {ErrorMsg} from "@/components/utils/utils";
import {getPasswordStrength} from "@cabildo-abierto/utils";
import {useIsMobile} from "@/components/utils/use-is-mobile";
import {useLoginModal} from "@/components/auth/login-modal-provider";
import {AcceptButtonPanel} from "@/components/utils/dialogs/accept-button-panel";
import {DateAndTimePicker} from "@/components/utils/date-and-time-picker";
import {Paragraph} from "@/components/utils/base/paragraph";


/** Format Date to YYYY-MM-DD using local date (avoids timezone issues for date-of-birth) */
function formatDateOnly(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

const pwStrLabel = [
    "muy débil",
    "débil",
    "regular",
    "fuerte",
    "muy fuerte"
]


const SignUpForm = ({
                        data,
                        setData,
                        onClickBack,
                        onSubmit
                    }: {
    data: SignupParams
    setData: (d: SignupParams) => void
    onClickBack: () => void
    onSubmit: StateButtonClickHandler
}) => {
    const [pwVisible, setPwVisible] = useState<boolean>(false)
    const validHandle = isValidHandle(data.handle)
    const validEmail = isValidEmail(data.email)
    const pwStr = getPasswordStrength(data.password)
    const validPw = data.password.length > 0 && pwStr >= 3
    const valid = validHandle && validEmail && validPw

    return <div className={"py-4 w-full flex flex-col items-center"}>
        <div className={"max-w-72 space-y-4"}>
            <BaseTextField
                value={data.email}
                onChange={e => {
                    setData({...data, email: e.target.value})
                }}
                type={"email"}
                label={"Correo electrónico"}
                placeholder={""}
            />

            <BaseTextField
                value={data.password}
                type={pwVisible ? "text" : "password"}
                onChange={e => {
                    setData({...data, password: e.target.value})
                }}
                label={"Contraseña"}
                placeholder={""}
                endIcon={<BaseIconButton
                    size={"small"}
                    className={"rounded-full mr-1"}
                    onClick={() => {
                        setPwVisible(!pwVisible)
                    }}
                >
                    {!pwVisible ? <EyeIcon/> : <EyeClosedIcon/>}
                </BaseIconButton>}
            />

            {data.password.length > 0 && <Note className={"text-xs text-left flex space-x-1"}>
                <div>
                    La contraseña es
                </div>
                <div className={"font-medium"}>{pwStrLabel[pwStr]}</div>
                .
                <div className={"flex"}>
                    {pwStr > 2 ? <CheckCircleIcon fontSize={14} className={"text-green-800"}/> :
                        <XCircleIcon fontSize={14} className={"text-red-800"}/>}
                </div>
            </Note>}

            <DateAndTimePicker
                time={false}
                value={data.dateOfBirth ? new Date(data.dateOfBirth + "T12:00:00") : new Date()}
                onChange={date => {
                    setData({...data, dateOfBirth: formatDateOnly(date)})
                }}
                label={"Fecha de nacimiento"}
                buttonClassName={"w-72"}
            />

            <BaseTextField
                value={data.handle.replace(".cabildo.ar", "")}
                onChange={e => {
                    setData({...data, handle: e.target.value + ".cabildo.ar"})
                }}
                startIcon={<AtIcon/>}
                label={"Nombre de usuario"}
                placeholder={""}
            />

            {!validHandle && data.handle.replace(".cabildo.ar", "").length > 0 && <ErrorMsg
                className={"text-xs"}
                text={"El nombre de usuario es inválido."}
            />}

            {validHandle && <Note className={"text-xs break-all"}>
                Tu nombre de usuario va a ser <span className={"font-medium"}>{data.handle}</span>
            </Note>}

            <div className={"flex justify-between space-x-2 pt-4"}>
                <BaseButton
                    variant={"outlined"}
                    className={"w-full text-[13px] max-w-28"}
                    onClick={onClickBack}
                >
                    Cancelar
                </BaseButton>

                <StateButton
                    variant={"outlined"}
                    className={"w-64"}
                    disabled={!valid}
                    handleClick={onSubmit}
                >
                    Crear cuenta
                </StateButton>
            </div>
        </div>
    </div>
}


export const SignUpPage = ({
                               inviteCode,
                               setPage
                           }: {
    inviteCode?: string
    setPage: (v: LoginModalPage) => void
}) => {
    const {setCreatedAccount} = useLoginModal()
    const {isMobile} = useIsMobile()
    const [data, setData] = useState<SignupParams>({
        handle: "",
        email: "",
        dateOfBirth: formatDateOnly(new Date(Date.now() - 18 * (365 * 24 + 1) * 60 * 60 * 1000)),
        password: "",
        code: inviteCode
    })
    const [viewProviderOptions, setViewProviderOptions] = useState<boolean>(false)
    const [accountCreatedModalOpen, setAccountCreatedModalOpen] = useState<boolean>(false)

    async function onSubmit() {
        const res = await post<SignupParams, SignupOutput>("/signup", data)
        if (res.success === true) {
            setAccountCreatedModalOpen(true)
        }
        return res.success === true ? {} : {error: res.error}
    }

    return <>
        <div className={"space-y-4 flex flex-col items-center pt-4"}>
            <div className="space-y-4 flex flex-col items-center">
                <Logo width={isMobile ? 48 : 64} height={isMobile ? 48 : 64}/>
                <h1 className={"text-lg font-semibold uppercase"}>Registro</h1>
            </div>

            <div className="flex justify-center sm:px-8">
                <div className="w-full flex flex-col items-center space-y-4 px-2 mb-4">
                    <div className={""}>
                        <SignUpForm
                            data={data}
                            setData={setData}
                            onClickBack={() => {
                                setPage("login")
                            }}
                            onSubmit={onSubmit}
                        />
                    </div>

                    <div className={"font-extralight flex flex-col space-y-4 pb-2 items-center text-center"}>
                        <div
                            onClick={() => {
                                setViewProviderOptions(true)
                            }}
                        >
                            <Note
                                className={""}
                            >
                            <span className={"text-xs underline hover:text-[var(--text-light)] cursor-pointer"}>
                                Usar otro proveedor de almacenamiento
                            </span>
                            </Note>
                        </div>
                        <AcceptButtonPanel
                            onClose={() => {
                                setViewProviderOptions(false)
                            }}
                            open={viewProviderOptions}
                        >
                            <div className={"font-light space-y-3 text-sm max-w-lg"}>
                                <h3 className={""}>
                                    Tus datos, tu decisión
                                </h3>
                                <Paragraph className={"text-sm"}>
                                    Cabildo Abierto es parte de una red abierta en la que podés elegir tu proveedor de
                                    almacenamiento. Tenés varias opciones:
                                </Paragraph>
                                <Paragraph className={"text-sm"}>
                                    <ul className={"ml-5 space-y-1"}>
                                        <li>
                                            Crear tu cuenta en Cabildo Abierto. Nosotros guardamos tus datos.
                                        </li>
                                        <li>
                                            Crear tu cuenta en otro proveedor y usarla en Cabildo Abierto. Algunos
                                            comunes son <Link href={"https://bsky.app"}>Bluesky</Link>, <Link
                                            href={"https://eurosky.tech"}>Eurosky</Link> o <Link
                                            href={"https://blacksky.community"}>Blacksky</Link>.
                                        </li>
                                        <li>
                                            <Link href={"https://atproto.com/guides/self-hosting"}>Crear tu propio
                                                servidor</Link> y almacenar tus datos donde quieras (requiere algunos
                                            conocimientos de programación).
                                        </li>
                                    </ul>
                                </Paragraph>
                                <Paragraph className={"text-sm"}>
                                    <p>
                                            <span className={"font-medium"}>
                                            ¿Qué efecto tiene esta decisión?
                                        </span>
                                    </p>
                                    <p>
                                        Una de las cosas buenas de esta red de redes (llamada <Link
                                        href={topicUrl("ATProtocol")}>ATProtocol</Link>) es que tu experiencia tanto en
                                        Cabildo Abierto como en Bluesky o cualquier otra plataforma de la red va a ser a
                                        grandes rasgos la misma sin importar dónde estén almacenados tus datos.
                                        Además, siempre está la opción de migrar más adelante.
                                    </p>
                                    <p>
                                        Sin embargo, el proveedor es importante porque (1) es quien cuida tus datos (si
                                        falla, se pueden llegar a perder) y (2) es quien decide en última instancia si
                                        guardar o no tus datos, según las leyes que apliquen en el lugar de origen del
                                        servidor y según sus propias reglas.
                                    </p>
                                </Paragraph>
                            </div>
                        </AcceptButtonPanel>

                        <Note
                            className={"text-xs"}
                        >
                            Al crear la cuenta aceptás los <Link
                            target="_blank"
                            className="hover:underline hover:text-[var(--text)]"
                            href={topicUrl("Cabildo Abierto: Términos y condiciones")}
                        >
                            Términos y condiciones</Link> y la <Link
                            target="_blank"
                            className="hover:underline hover:text-[var(--text)]"
                            href={topicUrl("Cabildo Abierto: Política de privacidad")}>
                            Política
                            de privacidad</Link>, ¡leelos!.
                        </Note>
                    </div>
                </div>
            </div>
        </div>
        <AcceptButtonPanel onClose={() => {
            setAccountCreatedModalOpen(false);
            setCreatedAccount(data.handle)
            setPage("login")
        }} open={accountCreatedModalOpen}>
            <div className={"text-center space-y-2 p-8"}>
                <div className={"font-medium text-lg"}>
                    ¡Se creó tu cuenta!
                </div>
                <Note>
                    Ya podés usarla para iniciar sesión.
                </Note>
            </div>
        </AcceptButtonPanel>
    </>
}