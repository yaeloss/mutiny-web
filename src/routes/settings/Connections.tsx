import { Browser } from "@capacitor/browser";
import { NwcProfile } from "@mutinywallet/mutiny-wasm";
import { createResource, createSignal, For, Show } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";
import { useSearchParams } from "solid-start";

import {
    BackLink,
    Button,
    Collapser,
    DefaultMain,
    InfoBox,
    KeyValue,
    LargeHeader,
    MiniStringShower,
    MutinyWalletGuard,
    NavBar,
    NiceP,
    SafeArea,
    SettingsCard,
    ShareCard,
    SimpleDialog,
    TextField,
    VStack
} from "~/components";
import { useI18n } from "~/i18n/context";
import { useMegaStore } from "~/state/megaStore";
import { eify } from "~/utils";

function Nwc() {
    const i18n = useI18n();
    const [state, _actions] = useMegaStore();

    const [nwcProfiles, { refetch }] = createResource(async () => {
        try {
            const profiles: NwcProfile[] =
                await state.mutiny_wallet?.get_nwc_profiles();

            return profiles;
        } catch (e) {
            console.error(e);
        }
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const queryName = searchParams.name;
    const [formName, setFormName] = createSignal(queryName || "");
    const [dialogOpen, setDialogOpen] = createSignal(!!queryName);
    const [createLoading, setCreateLoading] = createSignal(false);
    const [error, setError] = createSignal("");
    const [callbackDialogOpen, setCallbackDialogOpen] = createSignal(false);
    const [callbackUri, setCallbackUri] = createSignal<string | null>(null);

    async function createConnection() {
        try {
            setError("");
            setCreateLoading(true);

            if (formName() === "") {
                setError(i18n.t("settings.connections.error_name"));
                return;
            }
            const profile = await state.mutiny_wallet?.create_nwc_profile(
                formName()
            );

            if (!profile) {
                setError(i18n.t("settings.connections.error_connection"));
                return;
            } else {
                refetch();
            }

            setSearchParams({ name: "" });
            setDialogOpen(false);

            const callbackUriScheme = searchParams.callbackUri;
            if (callbackUriScheme) {
                const fullURI = profile.nwc_uri.replace(
                    "nostr+walletconnect://",
                    `${callbackUriScheme}://`
                );
                setCallbackUri(fullURI);
                setCallbackDialogOpen(true);
            }
        } catch (e) {
            setError(eify(e).message);
            console.error(e);
        } finally {
            setCreateLoading(false);
        }
    }

    function openCallbackUri() {
        if (callbackUri()) {
            Browser.open({ url: callbackUri() as string });
            setSearchParams({ callbackUri: "" });
            setCallbackDialogOpen(false);
        }
    }

    async function toggleEnabled(profile: NwcProfile) {
        try {
            await state.mutiny_wallet?.edit_nwc_profile({
                ...profile,
                enabled: !profile.enabled
            });
            refetch();
        } catch (e) {
            console.error(e);
        }
    }

    // this is because the TextField component has a bunch of required props
    function noop() {
        // do nothing
        return;
    }

    function openInNostrClient(uri: string) {
        Browser.open({ url: uri });
    }

    function openInPrimal(uri: string) {
        const connectString = uri.replace("nostr+walletconnect", "primal");
        Browser.open({ url: connectString });
    }

    return (
        <VStack biggap>
            <Button intent="blue" onClick={() => setDialogOpen(true)}>
                {i18n.t("settings.connections.add_connection")}
            </Button>
            <Show when={nwcProfiles() && nwcProfiles()!.length > 0}>
                <SettingsCard
                    title={i18n.t("settings.connections.manage_connections")}
                >
                    <For each={nwcProfiles()}>
                        {(profile) => (
                            <Collapser
                                title={profile.name}
                                activityLight={profile.enabled ? "on" : "off"}
                            >
                                <VStack>
                                    <KeyValue
                                        key={i18n.t(
                                            "settings.connections.relay"
                                        )}
                                    >
                                        <MiniStringShower
                                            text={profile.relay}
                                        />
                                    </KeyValue>

                                    <div class="w-full rounded-xl bg-white">
                                        <QRCodeSVG
                                            value={profile.nwc_uri}
                                            class="h-full max-h-[320px] w-full p-8"
                                        />
                                    </div>
                                    <ShareCard text={profile.nwc_uri || ""} />

                                    <Button
                                        layout="small"
                                        onClick={() =>
                                            openInNostrClient(profile.nwc_uri)
                                        }
                                    >
                                        {i18n.t(
                                            "settings.connections.open_in_nostr_client"
                                        )}
                                    </Button>

                                    <Button
                                        layout="small"
                                        onClick={() =>
                                            openInPrimal(profile.nwc_uri)
                                        }
                                    >
                                        {i18n.t(
                                            "settings.connections.open_in_primal"
                                        )}
                                    </Button>

                                    <Button
                                        layout="small"
                                        onClick={() => toggleEnabled(profile)}
                                    >
                                        {profile.enabled
                                            ? i18n.t(
                                                  "settings.connections.disable_connection"
                                              )
                                            : i18n.t(
                                                  "settings.connections.enable_connection"
                                              )}
                                    </Button>
                                </VStack>
                            </Collapser>
                        )}
                    </For>
                </SettingsCard>
            </Show>
            <SimpleDialog
                open={dialogOpen()}
                setOpen={setDialogOpen}
                title={i18n.t("settings.connections.new_connection")}
            >
                <div class="flex flex-col gap-4 py-4">
                    <TextField
                        name="name"
                        label={i18n.t(
                            "settings.connections.new_connection_label"
                        )}
                        ref={noop}
                        value={formName()}
                        onInput={(e) => setFormName(e.currentTarget.value)}
                        error={""}
                        onBlur={noop}
                        onChange={noop}
                        placeholder={i18n.t(
                            "settings.connections.new_connection_placeholder"
                        )}
                    />
                    <Show when={error()}>
                        <InfoBox accent="red">{error()}</InfoBox>
                    </Show>
                </div>

                <Button
                    intent="blue"
                    loading={createLoading()}
                    onClick={createConnection}
                >
                    {i18n.t("settings.connections.create_connection")}
                </Button>
            </SimpleDialog>
            <SimpleDialog
                open={callbackDialogOpen()}
                setOpen={setCallbackDialogOpen}
                title={i18n.t("settings.connections.open_app")}
            >
                <Button onClick={openCallbackUri}>
                    {i18n.t("settings.connections.open_app")}
                </Button>
            </SimpleDialog>
        </VStack>
    );
}

export default function Connections() {
    const i18n = useI18n();
    return (
        <MutinyWalletGuard>
            <SafeArea>
                <DefaultMain>
                    <BackLink
                        href="/settings"
                        title={i18n.t("settings.header")}
                    />
                    <LargeHeader>
                        {i18n.t("settings.connections.title")}
                    </LargeHeader>
                    <NiceP>{i18n.t("settings.connections.authorize")}</NiceP>
                    <Nwc />
                    <div class="h-full" />
                </DefaultMain>
                <NavBar activeTab="settings" />
            </SafeArea>
        </MutinyWalletGuard>
    );
}
