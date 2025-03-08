"use client"
import { NotFoundPage } from '../components/ui-utils/not-found-page'
import {ThemeProvider} from "@mui/material";
import theme from "../components/theme";


export default function NotFound() {
  return <ThemeProvider theme={theme}>
    <NotFoundPage/>
  </ThemeProvider>
}