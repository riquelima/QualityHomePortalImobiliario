import { useEffect, useRef, useState, useCallback } from 'react';

export interface GestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => void;
  minSwipeDistance?: number;
  pullToRefreshThreshold?: number;
  enablePullToRefresh?: boolean;
}

export interface GestureState {
  isRefreshing: boolean;
  pullDistance: number;
  swipeProgress: number;
  activeGesture: 'none' | 'swipe-back' | 'swipe-next' | 'swipe-prev' | 'pull-refresh';
  isDragging: boolean;
}

export const useGestures = (config: GestureConfig = {}) => {
  // Detectar tipo de dispositivo e ajustar configurações
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
  const devicePixelRatio = window.devicePixelRatio || 1;
  
  // Ajustar distâncias baseado no dispositivo
  const getResponsiveDistance = (baseDistance: number) => {
    if (isTablet) return baseDistance * 1.5;
    if (isMobile && devicePixelRatio > 2) return baseDistance * 1.2;
    return baseDistance;
  };

  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    minSwipeDistance = getResponsiveDistance(50),
    pullToRefreshThreshold = getResponsiveDistance(80),
    enablePullToRefresh = false,
  } = config;

  const [gestureState, setGestureState] = useState<GestureState>({
    isRefreshing: false,
    pullDistance: 0,
    swipeProgress: 0,
    activeGesture: 'none',
    isDragging: false,
  });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchMoveRef = useRef<{ x: number; y: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const lastMoveTime = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Throttle para touchmove (limitar a 60fps)
  const throttledSetGestureState = useCallback((updater: (prev: GestureState) => GestureState) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      setGestureState(updater);
    });
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchMoveRef.current = null;
    
    if (enablePullToRefresh) {
      setGestureState(prev => ({ ...prev, isDragging: true }));
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStartRef.current) return;

    // Throttle touchmove events
    const now = Date.now();
    if (now - lastMoveTime.current < 16) return; // ~60fps
    lastMoveTime.current = now;

    const touch = e.touches[0];
    touchMoveRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Pull to refresh logic
    if (enablePullToRefresh && deltaY > 0 && window.scrollY === 0) {
      e.preventDefault();
      const pullDistance = Math.min(deltaY * 0.5, pullToRefreshThreshold * 1.5);
      const progress = Math.min(pullDistance / pullToRefreshThreshold, 1);
      throttledSetGestureState(prev => ({ 
        ...prev, 
        pullDistance,
        swipeProgress: progress,
        activeGesture: 'pull-refresh',
        isDragging: true 
      }));
    }
    // Swipe feedback logic
    else if (absX > absY && absX > 20) {
      const progress = Math.min(absX / minSwipeDistance, 1);
      const gestureType = deltaX > 0 ? 'swipe-back' : 'swipe-next';
      throttledSetGestureState(prev => ({ 
        ...prev, 
        swipeProgress: progress,
        activeGesture: gestureType,
        isDragging: true 
      }));
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartRef.current || !touchMoveRef.current) {
      setGestureState(prev => ({ 
        ...prev, 
        isDragging: false, 
        pullDistance: 0,
        swipeProgress: 0,
        activeGesture: 'none'
      }));
      return;
    }

    const deltaX = touchMoveRef.current.x - touchStartRef.current.x;
    const deltaY = touchMoveRef.current.y - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Check if it's a valid swipe (fast enough and long enough)
    const isValidSwipe = (absX > minSwipeDistance || absY > minSwipeDistance) && deltaTime < 500;
    
    if (isValidSwipe) {
      // Determine swipe direction
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    // Pull to refresh logic
    if (enablePullToRefresh && gestureState.pullDistance >= pullToRefreshThreshold && onPullToRefresh) {
      setGestureState(prev => ({ 
        ...prev, 
        isRefreshing: true,
        isDragging: false 
      }));
      
      onPullToRefresh();
      
      // Reset after refresh
      setTimeout(() => {
        setGestureState(prev => ({ 
          ...prev, 
          isRefreshing: false, 
          pullDistance: 0,
          swipeProgress: 0,
          activeGesture: 'none'
        }));
      }, 1500);
    } else {
      setGestureState(prev => ({ 
        ...prev, 
        isDragging: false, 
        pullDistance: 0,
        swipeProgress: 0,
        activeGesture: 'none'
      }));
    }

    touchStartRef.current = null;
    touchMoveRef.current = null;
  };

  const bindGestures = (element: HTMLElement | null) => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchmove', handleTouchMove);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
    }

    if (element) {
      elementRef.current = element;
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  };

  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart);
        elementRef.current.removeEventListener('touchmove', handleTouchMove);
        elementRef.current.removeEventListener('touchend', handleTouchEnd);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    bindGestures,
    gestureState,
    resetRefresh: () => setGestureState(prev => ({ 
      ...prev, 
      isRefreshing: false, 
      pullDistance: 0,
      swipeProgress: 0,
      activeGesture: 'none'
    })),
  };
};