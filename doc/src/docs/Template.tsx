import {Box, Container} from '@mui/material'
import {HEADER_HEIGHT} from '../frame/Header/Header'

export function Template({children}: React.PropsWithChildren) {
  return (
    <Box flexGrow={1} height={`calc(100dvh - ${HEADER_HEIGHT}px)`} overflow='auto'>
      <Container sx={{p: 4}} maxWidth="md">
        {children}
      </Container>
    </Box>
  )
}