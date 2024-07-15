import {Box, Button, Divider, Icon, IconButton, SxProps, Theme, Typography, styled} from '@mui/material'
import {PrismLight as SyntaxHighlighter} from 'react-syntax-highlighter'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import {vscDarkPlus} from 'react-syntax-highlighter/dist/esm/styles/prism'
import {CSSProperties, useMemo} from 'react'
import {useIsXs} from '../theme/hooks'

const BodyTextTypography = styled(Typography)(({theme}) => ({color: theme.palette.grey[300]}))

export function TitleText({children}: React.PropsWithChildren) {
  return (
    <>
      <Typography variant='h3' noWrap>{children}</Typography>
      <Divider sx={{pt: 2}}/>
    </>
  )
}

export function SubTitleText({children}: React.PropsWithChildren) {
  return <Typography variant='h4' sx={{mt: 4, mb: 2}}>{children}</Typography>
}

export function CaptionText({children}: React.PropsWithChildren) {
  return <Typography variant='h5' sx={{mt: 4, mb: 2}}>{children}</Typography>
}

export function BodyText({children, sx}: React.PropsWithChildren & {sx?: SxProps<Theme>}) {
  return (
    <BodyTextTypography variant='body1' sx={{mb: 4, color: '#bbb', ...sx}}>
      {children}
    </BodyTextTypography>
  )
}

const useSyntaxHighlighter = () => useMemo(() => {
  SyntaxHighlighter.registerLanguage('tsx', tsx)
  return SyntaxHighlighter
}, [])

const syntaxHighlighterStyle: CSSProperties = {
  border      : '1px solid #555',
  borderRadius: '12px',
  padding     : '8px 16px 8px 16px'
}

type SyntaxArg = {children: string, lang?: 'tsx' | undefined, sandbox?: string}
export function Syntax({children, lang, sandbox}: SyntaxArg) {
  const SyntaxHighlighter = useSyntaxHighlighter()
  return (
    <Box position='relative' >
      <SyntaxHighlighter language={lang} style={vscDarkPlus} customStyle={syntaxHighlighterStyle}>
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

function SandboxButton({children}: {children: string}) {
  const isXs = useIsXs()
  return (
    isXs ?
      <IconButton
        sx={{position: 'absolute', bottom: 16, right: 12, backgroundColor: '#88888822'}}
        color="primary"
        LinkComponent={'a'}
        href={children}
        target="_blank"
      >
        <Icon >code</Icon>
      </IconButton>
      :
      <Button
        sx={{position: 'absolute', bottom: 12, right: 12, fontSize: 12, textTransform: 'unset'}}
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