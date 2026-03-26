import {AtIcon} from "@phosphor-icons/react";
import {useBlueskyLogin} from "./bsky-login";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {BaseButton} from "@/components/utils/base/base-button";
import {FieldError} from "@/components/utils/ui/field";
import {Note} from "@/components/utils/base/note";
import {useSession} from "@/components/auth/use-session";
import {BaseSelect} from "@/components/utils/base/base-select";
import Link from "next/link";

export const BlueskyLogin = ({
                                 inviteCode,
                                 onLogin
                             }: {
    inviteCode?: string
    onLogin?: () => void
}) => {
    const {
        handleSubmit,
        error,
        isLoading,
        setHandleStart,
        setDomain,
        domain,
        handleStart
    } = useBlueskyLogin({inviteCode, onLogin})
    const {isFetching} = useSession()

    return <div className={"max-w-96 w-full"}>
        <form
            action={"/login"}
            autoComplete={"on"}
            onSubmit={handleSubmit}
            className={"space-y-4"}
        >
            <div className={"space-y-2 flex flex-col items-center"}>
                <div className={"flex space-x-2 items-center"}>
                    <BaseTextField
                        name="ca_username"
                        id="ca_username"
                        autoComplete="username"
                        label="Nombre de usuario"
                        autoFocus
                        value={handleStart}
                        onChange={(e) => {
                            setHandleStart(e.target.value)
                        }}
                        inputClassName={"h-9"}
                        startIcon={<span className={"text-[var(--text-light)] pt-[2px]"}><AtIcon/></span>}
                    />
                    {[".cabildo.ar", ".bsky.social"].includes(domain) ? <BaseSelect
                        label="Dominio"
                        value={domain}
                        onChange={(e) => {
                            setDomain(e == "otro" ? "" : e);
                        }}
                        size={"small"}
                        options={[".cabildo.ar", ".bsky.social", "otro"]}
                        triggerClassName={"w-32 h-[37px]"}
                        contentClassName={"z-[2000]"}
                        itemClassName={"h-[37px]"}
                        className={"max-w-32"}
                    /> : <BaseTextField
                        label={"Dominio"}
                        value={domain}
                        autoFocus={true}
                        onChange={(e) => {
                            setDomain(e.target.value)
                        }}
                        inputClassName={"h-9"}
                        className={"w-[206px]"}
                    />}
                </div>
                {error && <FieldError>
                    {error}
                </FieldError>}
                <Note text={"text-xs"}>
                    Tu cuenta de Cabildo Abierto y Bluesky es la misma.
                </Note>
                <Note text={"text-xs"}>
                    <Link href={"/recuperacion"}>
                        Olvidé mi cuenta o contraseña
                    </Link>.
                </Note>
            </div>
            <BaseButton
                type="submit"
                loading={isLoading || isFetching}
                variant="outlined"
                className={"w-full text-[13px]"}
            >
                Iniciar sesión
            </BaseButton>
        </form>
    </div>
}