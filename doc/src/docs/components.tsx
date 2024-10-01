import {Box, Button, Divider, Icon, IconButton, SxProps, Theme, Typography, styled} from '@mui/material'
import {PrismLight as SyntaxHighlighter} from 'react-syntax-highlighter'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import {vscDarkPlus} from 'react-syntax-highlighter/dist/esm/styles/prism'
import {CSSProperties, useMemo} from 'react'
import {useIsXs} from '../theme/hooks'
import {Trans} from 'react-i18next'
import {Link} from 'wouter'

const BodyTextTypography = styled(Typography)(({theme}) => ({color: theme.palette.grey[300]}))

export function TitleText({children}: React.PropsWithChildren) {
  return (
    <>
      <Typography variant='h3' noWrap sx={{lineHeight: 1.4, color: '#f5f5f5'}}>{children}</Typography>
      <Divider sx={{pt: 1}}/>
    </>
  )
}

export function SubTitleText({children, sx}: React.PropsWithChildren& {sx?: SxProps<Theme>}) {
  return <Typography variant='h4' sx={{mt: 4, mb: 2, color: '#eee', ...sx}}>{children}</Typography>
}

export function CaptionText({children}: React.PropsWithChildren) {
  return <Typography variant='h5' sx={{mt: 4, mb: 2, color: '#e0e0e0'}}>{children}</Typography>
}

export function CaptionText2({children, sx}: React.PropsWithChildren& {sx?: SxProps<Theme>}) {
  return <Typography variant='h6' sx={{mt: 4, mb: 2, ...sx}}>{children}</Typography>
}

export function BodyText({children, sx}: React.PropsWithChildren & {sx?: SxProps<Theme>}) {
  return (
    <BodyTextTypography variant='body1' sx={{mb: 4, color: '#b5b5b5', lineHeight: 1.7, ...sx}}>
      {children}
    </BodyTextTypography>
  )
}

export function Code({children, noWrap}: React.PropsWithChildren<{noWrap?: boolean}>) {
  return (
    <Typography variant='body1' component='code' noWrap={noWrap} sx={{
      mx             : 0.5,
      px             : 1,
      color          : '#ddd',
      backgroundColor: '#333',
      borderRadius   : '7.5px',
      fontFamily     : 'Source Code Pro,Console'
    }}>
      {children}
    </Typography>
  )
}

export function TransWithCode({children} : {children : string}) {
  return <Trans components={{c: <Code ></Code>}}>{children}</Trans>
}

const useSyntaxHighlighter = () => useMemo(() => {
  SyntaxHighlighter.registerLanguage('tsx', tsx)
  return SyntaxHighlighter
}, [])

const syntaxHighlighterStyle: CSSProperties = {
  border      : '1px solid #8884',
  borderRadius: '12px',
  padding     : '8px 16px 8px 16px'
}

type SyntaxArg = {children: string, lang?: 'tsx' | undefined, sandbox?: string}
export function Syntax({children, lang, sandbox}: SyntaxArg) {
  const SyntaxHighlighter = useSyntaxHighlighter()
  vscDarkPlus['code[class*="language-"]'].fontFamily = 'Source Code Pro,Console'
  vscDarkPlus['code[class*="language-"]'].fontWeight = 600
  return (
    <Box position='relative' >
      <SyntaxHighlighter language={lang} style={vscDarkPlus} customStyle={syntaxHighlighterStyle} >
        {children}
      </SyntaxHighlighter>
      {sandbox &&
        <SandboxButton >
          {sandbox}
        </SandboxButton>
      }
    </Box>
  )
}

export function SyntaxTsx({children}: {children: string}) {
  return <Syntax lang='tsx'>{children}</Syntax>
}

export function SandboxButton({children}: {children: string}) {
  const isXs = useIsXs()
  return (
    isXs ?
      <IconButton
        sx={{
          position       : 'absolute',
          bottom         : 16,
          right          : 12,
          backgroundColor: '#99999933',
          backdropFilter : 'blur(4px) saturate(50%)'
        }}
        color="primary"
        LinkComponent={'a'}
        href={children}
        target="_blank"
      >
        <Icon >code</Icon>
      </IconButton>
      :
      <Button
        sx={{
          position      : 'absolute',
          bottom        : 12,
          right         : 12,
          fontSize      : 12,
          textTransform : 'unset',
          borderRadius  : 16,
          backdropFilter: 'blur(24px) saturate(50%)'

        }}
        variant='outlined'
        startIcon={<Icon >code</Icon>}
        LinkComponent={'a'}
        href={children}
        target="_blank"
      >
        CodeSandbox
      </Button>
  )
}

export function NavigationButton({caption, title, href}: {caption: string, title: string, href: string}) {
  return (
    <Button
      sx={{display: 'flex', flexDirection: 'column', textTransform: 'unset', flexGrow: 0.4, pt: 1, pb: 1.5}}
      variant='outlined'
      LinkComponent={Link}
      href={href}
    >
      <Typography variant='caption' color='lightgray'>{caption}</Typography>
      <Typography>{title}</Typography>
    </Button>
  )
}