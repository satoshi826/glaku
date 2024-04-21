import {useTheme, useMediaQuery} from '@mui/material'

export const useIsXs = () => {
  const {breakpoints} = useTheme()
  return useMediaQuery(breakpoints.down('sm'))
}
