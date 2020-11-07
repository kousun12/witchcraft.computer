import { Label, Box, Flex } from 'theme-ui';

const AudioButtonIcon = () => {
  return (
    <Flex
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
        <path
          xmlns="http://www.w3.org/2000/svg"
          d="M13.4179 2.0915C13.7727 2.25469 14 2.60948 14 3.00001V21C14 21.3905 13.7727 21.7453 13.4179 21.9085C13.0631 22.0717 12.6457 22.0134 12.3492 21.7593L5.63008 16H3C2.44772 16 2 15.5523 2 15V9.00001C2 8.44773 2.44772 8.00001 3 8.00001H5.63008L12.3492 2.24076C12.6457 1.9866 13.0631 1.92832 13.4179 2.0915ZM12 5.17423L6.65079 9.75927C6.46955 9.91462 6.23871 10 6 10H4V14H6C6.23871 14 6.46955 14.0854 6.65079 14.2408L12 18.8258V5.17423ZM17.2929 5.29291C17.6834 4.90238 18.3166 4.90238 18.7071 5.29291L18.7078 5.29362L18.7086 5.29438L18.7102 5.29605L18.7141 5.29996L18.724 5.31008C18.7315 5.31784 18.7409 5.32765 18.752 5.33951C18.7742 5.36322 18.8034 5.39513 18.8385 5.43526C18.9087 5.51549 19.0028 5.62871 19.1125 5.77501C19.3318 6.06748 19.6147 6.49329 19.8944 7.0528C20.4556 8.17509 21 9.82725 21 12C21 14.1728 20.4556 15.8249 19.8944 16.9472C19.6147 17.5067 19.3318 17.9326 19.1125 18.225C19.0028 18.3713 18.9087 18.4845 18.8385 18.5648C18.8034 18.6049 18.7742 18.6368 18.752 18.6605C18.7409 18.6724 18.7315 18.6822 18.724 18.69L18.7141 18.7001L18.7102 18.704L18.7086 18.7056L18.7078 18.7064L18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071C16.904 18.3183 16.9024 17.6889 17.2879 17.2979L17.2929 17.2926C17.3 17.2851 17.3138 17.2701 17.3334 17.2478C17.3725 17.203 17.4347 17.1287 17.5125 17.025C17.6682 16.8175 17.8853 16.4933 18.1056 16.0528C18.5444 15.1751 19 13.8272 19 12C19 10.1728 18.5444 8.82494 18.1056 7.94723C17.8853 7.50674 17.6682 7.18255 17.5125 6.97501C17.4347 6.87131 17.3725 6.79704 17.3334 6.75227C17.3138 6.72989 17.3 6.71493 17.2929 6.70739L17.2879 6.70208C16.9024 6.31117 16.904 5.68176 17.2929 5.29291ZM15.2929 8.29291C15.6834 7.90238 16.3166 7.90238 16.7071 8.29291L16.7085 8.29434L16.7101 8.29587L16.7134 8.29923L16.7211 8.30715L16.7408 8.32779C16.7557 8.34369 16.7741 8.36388 16.7955 8.38838C16.8384 8.43736 16.8934 8.50371 16.9563 8.58751C17.0818 8.75498 17.2397 8.99329 17.3944 9.3028C17.7056 9.92509 18 10.8272 18 12C18 13.1728 17.7056 14.0749 17.3944 14.6972C17.2397 15.0067 17.0818 15.2451 16.9563 15.4125C16.8934 15.4963 16.8384 15.5627 16.7955 15.6116C16.7741 15.6361 16.7557 15.6563 16.7408 15.6722L16.7211 15.6929L16.7134 15.7008L16.7101 15.7042L16.7085 15.7057L16.7078 15.7064C16.3173 16.0969 15.6834 16.0976 15.2929 15.7071C14.9057 15.32 14.9024 14.6943 15.2829 14.303C15.2843 14.3015 15.2868 14.2987 15.2904 14.2946C15.3022 14.2811 15.3253 14.2537 15.3562 14.2125C15.4182 14.13 15.5103 13.9933 15.6056 13.8028C15.7944 13.4251 16 12.8272 16 12C16 11.1728 15.7944 10.5749 15.6056 10.1972C15.5103 10.0067 15.4182 9.87005 15.3562 9.78751C15.3253 9.74631 15.3022 9.71892 15.2904 9.70539C15.2868 9.70132 15.2843 9.69852 15.2829 9.69701C14.9024 9.30574 14.9057 8.68008 15.2929 8.29291Z"
          fill="#282828"
        ></path>
      </svg>
      <Box>
        <Label variant="buttonLabel">Audio</Label>
      </Box>
    </Flex>
  );
};
export default AudioButtonIcon;
