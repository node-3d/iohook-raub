#pragma once

#include <addon-tools.hpp>

#include "uiohook.h"


namespace iohook {

class HookProcessWorker : public Napi::AsyncProgressWorker<uiohook_event> {
	public:
		typedef Napi::AsyncProgressWorker<uiohook_event>::ExecutionProgress HookExecution;
	
		HookProcessWorker(Napi::Function &callback);
	
		void Execute(const ExecutionProgress &progress);
		void OnProgress(const uiohook_event *event, size_t size);
		void Stop();
	
		const HookExecution* fHookExecution;
};

DBG_EXPORT JS_METHOD(startHook);
DBG_EXPORT JS_METHOD(stopHook);
DBG_EXPORT JS_METHOD(debugEnable);

}
