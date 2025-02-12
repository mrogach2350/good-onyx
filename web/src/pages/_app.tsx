import type { AppProps } from "next/app";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "bulma/css/bulma.min.css";
import "@/styles/globals.css";
import NavBar from "../components/NavBar";
import ServerListener from "../components/ServerListener";
import NotificationsCard from "../components/NotificationsCard";

config.autoAddCss = false;

ModuleRegistry.registerModules([AllCommunityModule]);
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps.dehydratedState}>
        <ServerListener />
        <NavBar />
        <Component {...pageProps} />
        <NotificationsCard />
      </HydrationBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
